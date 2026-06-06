# Ações urgentes pendentes — app-m-dico-gratuito-felipe-ipad

Pendências geradas pelo refactor de otimização Firebase Spark Free
(branch `claude/busy-noether-xeaKi`, PR #7).

## 1. Deploy de regras, índices e storage

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Por quê
- `firestore.rules` ganhou cap `request.query.limit <= 200` e reforço
  de isolamento de tenant em `collectionGroup`.
- `firestore.indexes.json` define índices compostos
  `(tenantId, createdAt desc)` para `pacientes`, `consultas`,
  `agendamentos`.
- `storage.rules` valida `contentType` e tamanho dos uploads.

⚠️ **Sem este deploy, queries com `orderBy + where` em produção
falham com erro de índice ausente.**

## 2. Limpeza em cascata de Storage ao deletar paciente

Implementado no cliente: ao remover um paciente, os exames associados
em `Storage` são apagados em loop. Validar manualmente após o deploy:

- [ ] Deletar paciente de teste com ≥3 exames PDF.
- [ ] Conferir no console Firebase → Storage que `pacientes/{uid}/{id}/*`
      ficou vazio.

Se a cascade falhar (timeout, paciente com muitos exames), considerar
mover para Cloud Function `onDelete`.

## 3. CI do GitHub Actions

Este repo não tinha workflow de build CI — só o `deploy-pages.yml`.
O **Vercel Preview** é o gate. Se quiser adicionar CI futuramente,
criar `.github/workflows/ci.yml` com `npm ci + lint + build`.

## 4. Verificação pós-deploy

- [ ] Console Firebase: rules e índices `READY`.
- [ ] Listeners do `PatientDetails` mudam de aba sem disparar 8
      `onSnapshot` simultâneos (verificar Network do DevTools).
- [ ] Reports/Consultations carregam paginados (≤200 itens) sem
      timeout.
- [ ] Upload de exame respeita limite de tamanho/tipo definido em
      `storage.rules`.

## 5. Pendência arquitetural (futuro)

- Centralizar listeners em um `useFirestoreSubscriptions` context
  para evitar duplicação cross-page.
- Cloud Function de cleanup de Storage >180 dias para evitar
  acúmulo (5 GB no Spark).
