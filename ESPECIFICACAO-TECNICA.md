# 📐 ESPECIFICAÇÃO TÉCNICA — LEITURA OBRIGATÓRIA

> **Este documento DEVE ser lido antes de adicionar qualquer nova feature,
> recurso ou refatoração no projeto.** Define os limites de infraestrutura
> Firebase Free (Spark) e as regras de plano que sustentam o Clinicafy
> sem custo. Violar estas restrições derruba a operação ou estoura quota.

---

## 1. Infraestrutura — Firebase Spark Free + Vercel Hobby

### Quotas diárias
| Recurso | Limite Spark Free | Onde estoura |
|---|---|---|
| Firestore reads | **50.000/dia** | Dashboard (3 listeners), ReportsPage, ConsultationsList |
| Firestore writes | **20.000/dia** | Consultas, anamneses, exames metadata |
| Firestore deletes | **20.000/dia** | Cleanups de paciente |
| **Storage stored** | **5 GB** ⚠️ gargalo | Exames PDF (até 5 MB cada) |
| Storage download | **1 GB/dia** | Visualização de exames |
| Firestore stored | **1 GiB** | Pacientes, consultas, agendamentos |
| Auth | ilimitado | – |

---

## 2. Plano FREE — Limites por Médico

| Recurso | Limite FREE | Justificativa |
|---|---|---|
| **Pacientes cadastrados** | **30** | 10 médicos × 30 pacientes × 3 exames = 900 exames × 5 MB = 4,5 GB Storage |
| **Exames PDF por paciente** | **3** (máx 5 MB cada) | Cap principal de Storage |
| **Consultas/dia** | **10** | ~30 reads + 5 writes por consulta |
| **Agendamentos/mês** | **200** | Para clínica solo |
| **Anamneses por paciente** | **5** | Versões de histórico clínico |
| **Receitas/prescrições/mês** | **100** | Em proporção a consultas |
| **Recibos/mês** | **50** | Numeração automática |
| **Guias TISS/mês** | **30** | Apenas convênios principais |

### Plano PRO (futuro)
Sem caps. Storage 5 GB / médico. Reservado para Blaze.

### Capacidade global Spark Free
- **Médicos ativos/dia**: ~50–100
- **Consultas/dia (total)**: ~3.000–4.000
- **Exames totais armazenados**: ~1.000 (5 GB ÷ 5 MB)
- **Limita primeiro**: **Storage de exames** ⚠️

---

## 3. Regras Arquiteturais Obrigatórias

### 3.1 Toda query Firestore DEVE
- Usar `limit(N)` — máximo **200** em listagens
- Ter `orderBy` em paginação
- Ter índice composto em `firestore.indexes.json` para `where + orderBy`
- Filtrar por `tenantId` (multi-tenancy)

### 3.2 Listeners
- `unsubscribe` no cleanup do `useEffect` sempre
- **Lazy por aba** em PatientDetails (não montar 3 listeners de uma vez)
- Preferir `getDocs` para one-shot

### 3.3 Stats agregados (`src/lib/stats.ts`)
- Dashboard lê `users/{tenantId}/stats/summary` (1 doc)
- Atualizados nos writes de CRUD
- Fallback com `limit(200)` se ausente

### 3.4 Writes
- Loops → `writeBatch` (chunks 400)
- Sem `Promise.all` com 100+ ops

### 3.5 Cache IndexedDB
- Habilitado em `src/lib/firebase.ts` via `persistentLocalCache`
- Sem polling forçado

### 3.6 Firestore Rules
- Cap `request.query.limit <= 200` em rules `list`
- Isolamento `tenantId == request.auth.uid` em `collectionGroup`
- Sem rules permissivas (`allow read: if true`)

### 3.7 Storage (CRÍTICO — gargalo do app)
- Rules validam `contentType` (application/pdf, image/*)
- Tamanho máximo:
  - Exames: 5 MB
  - Avatars/logos: 2 MB
- **Cascade obrigatório**: ao deletar paciente, apagar todos exames
  (`src/lib/patient-delete.ts`)
- Reforço de limite 3 exames/paciente no client-side
- TODO: Cloud Function de TTL >180 dias para evitar acúmulo

---

## 4. Antipadrões PROIBIDOS

❌ `collectionGroup(...).get()` sem `limit()`
❌ 3 listeners paralelos em PatientDetails (use lazy por aba)
❌ Upload de PDF sem validação de tamanho (5 MB max)
❌ Deletar paciente sem cascade no Storage
❌ Cadastrar paciente sem checar limite Free (30)
❌ Cadastrar 4º exame em paciente Free
❌ Rules sem `tenantId` matching em `collectionGroup`
❌ Storage upload em pastas não controladas

---

## 5. Antes de Adicionar Nova Feature

**Checklist obrigatório:**

- [ ] Cálculo de reads/writes/storage por médico/paciente/dia foi feito?
- [ ] Cabe em 50k reads / 20k writes / 5 GB Storage?
- [ ] Adiciona uploads? Quanto Storage por usuário/mês?
- [ ] Listeners têm cleanup e são lazy?
- [ ] `limit()` e `orderBy` em todas as queries?
- [ ] Índice composto adicionado se necessário?
- [ ] Rules com cap de limit + ownership?
- [ ] UI bloqueia se plano Free excede limites (30 pacientes / 3 exames)?
- [ ] Stats `summary` atualizado nos writes?
- [ ] Storage cascade testado em deleção?

Se qualquer item falhar, **a feature não pode ser mergeada** sem
mitigação documentada aqui.

---

## 6. Quando Migrar para Blaze

⚠️ **Storage é o primeiro a estourar.** Migrar se:
- Storage > 4 GB (provavelmente antes de 50 médicos ativos)
- Reads sustentados > 40k/dia
- Necessidade de Cloud Functions (cleanup, MP webhook server-side)

Custo Blaze 50 médicos × 30 pacientes × 3 exames: **US$ 5–15/mês**.

Alternativa para postergar: **migrar exames PDF para Google Drive/S3**
e guardar só o link no Firestore — libera 5 GB de Storage.

---

## 7. Referências Internas

- `src/lib/firebase.ts` — init + cache
- `src/lib/stats.ts` — stats agregados
- `src/lib/patient-delete.ts` — cascade Storage
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- `acoes-urgentes-pendentes/README.md` — deploys e migrações

---

**Última revisão**: 2026-06-04 (refactor Spark Free, PR #7 mergeado).
**Responsável**: qualquer dev que tocar Firebase, planos, queries ou
Storage.
