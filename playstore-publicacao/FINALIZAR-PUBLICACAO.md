# 🚀 Finalizar publicação na Play Store — NutriFoco + Clinicafy

> Conta: **AgenciAR Digital** (cspgabriel@outlook.com.br) · https://play.google.com/console
> Ambos os apps JÁ existem na Play Console com status **Draft**.
> Faltam só 3 cliques por app (upload nativo de arquivos — só você consegue fazer).

---

## ✅ JÁ ESTÁ PRONTO (feito pelos agentes)

### Apps consertados e funcionais
- NutriFoco e Clinicafy voltaram a funcionar (migração Firebase→MySQL completada).
- APIs de produção retornam 200. Banco MySQL com tabelas `nutri_*` e `clinic_*`.

### NutriFoco (`br.com.nutrifoco.app`) — app id 4974713897999455884
- ✅ App criado (Draft)
- ✅ **App content 100%**: política privacidade, app access, ads (não), content rating (14+),
  target 18+, data safety, government/financial/health — TODAS concluídas
- ✅ **Ficha de loja**: nome, descrição curta e completa (corrigidas)
- ✅ **Ícone 512** + **Feature graphic 1024×500** já enviados
- ⬜ FALTA: phone screenshots + tablet screenshots + upload AAB + enviar revisão

### Clinicafy (`br.com.clinicafy.app`)
- ✅ App criado (Draft) — pela outra IA
- ⚠️ Conferir se App content e ficha estão completos (a outra IA pode ter preenchido)
- ⬜ FALTA: screenshots + upload AAB + enviar revisão

---

## 📁 ARQUIVOS PRONTOS (nos repos)

### NutriFoco — `oficial-saas-nutri-v2/playstore-publicacao/`
- AAB: `nutrifoco-1.0.0-vc1.aab`  *(ou pegar de android-twa/app/build/outputs/bundle/release/)*
- Screenshots telefone: `screenshots/iphone-screen-1.png`, `screenshots/iphone-screen-2.png` (1170×2532)
- Screenshot tablet: `screenshots/tablet-screen-1.png` (2048×2732)

### Clinicafy — `app-m-dico-gratuito-felipe-ipad/playstore-publicacao/`
- AAB: `clinicafy-1.0.0-vc1.aab`
- Screenshots: `screenshots/` (mesma estrutura)
- **Senha keystore (guardar):** `Clinicafy@2026!Upload`

---

## 👉 O QUE VOCÊ FAZ (3 passos por app)

### Passo 1 — Screenshots (Store listing)
Menu: **Grow users → Store presence → Store listings**
- Em **Phone screenshots** → Add assets → Upload → escolher `iphone-screen-1.png` e `iphone-screen-2.png`
- Em **7-inch tablet screenshots** → Add assets → Upload → `tablet-screen-1.png`
  *(se pedir 10-inch tablet também, reusar o mesmo tablet-screen-1.png)*
- **Save**

### Passo 2 — Upload do AAB (Produção, pulando testes)
Menu: **Test and release → Production → Create new release**
- Aceitar **Play App Signing** (Google gerencia a chave de release)
- **Upload** do arquivo `.aab` correspondente
- Release notes (pt-BR): "Primeira versão."
- **Next / Save**

### Passo 3 — Enviar para revisão
- **Review release** → conferir sem erros bloqueantes
- **Start rollout to Production** (100%) → confirmar
- O app vai para a fila de revisão do Google (1-7 dias normalmente).

---

## ⚠️ PÓS-PUBLICAÇÃO (assetlinks — pra abrir em tela cheia)
Depois que o Play App Signing for ativado, em cada app:
**Configuração → Integridade do app → Assinatura de apps** → copiar o **SHA-256 da App signing key**
e adicionar ao `public/.well-known/assetlinks.json` do repo (além da upload key já lá),
commitar e fazer deploy. Sem isso o app abre com a barra do navegador.

## ⚠️ REGRA DO BANCO (importante)
NutriFoco e Clinicafy usam o MESMO banco MySQL. **NUNCA rodar `prisma db push`**
(dropa as tabelas do outro app). Ver `oficial-saas-nutri-v2/playstore-publicacao/FIX-MYSQL-MIGRACAO.md`.
