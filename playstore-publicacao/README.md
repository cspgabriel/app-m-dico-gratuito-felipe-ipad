# Clinicafy — Google Play Store Publication

**Pacote:** `br.com.clinicafy.app`  
**Versão:** 1.0.0 (versionCode 1)  
**Conta Developer:** AgenciAR Digital — Account ID 6362153657561875786 (cspgabriel@outlook.com.br)

---

## Status de Publicação

| Etapa | Status |
|-------|--------|
| App criado na Play Console | ⏳ Pendente (package `br.com.clinicafy.app`) |
| AAB assinado | ✅ `app/build/outputs/bundle/release/clinicafy-signed.aab` |
| assetlinks.json publicado | ✅ https://www.clinicafy.com.br/.well-known/assetlinks.json |
| Política de Privacidade | ✅ https://www.clinicafy.com.br/privacidade |
| Ícone 512×512 | ✅ `assets/icon-512.png` |
| Feature Graphic 1024×500 | ✅ `assets/feature-graphic.png` |
| Screenshots (mín. 2) | ✅ `screenshots/` |
| Ficha da loja preenchida | ✅ `ficha-loja.md` |
| Data Safety preenchida | ✅ `data-safety.md` |
| IARC / Content Rating | ✅ documentado em `content-rating.md` |
| Declaração de saúde | ✅ documentado em `declaracoes.md` |
| Upload do AAB para produção | ⏳ Pendente (aguardando criação do app na Play Console) |

---

## Como publicar (passo a passo)

### 1. Criar o app na Play Console
1. Acesse https://play.google.com/console/u/0/developers/6362153657561875786/app-list
2. Clique em **Criar app**
3. Nome: `Clinicafy: Gestão de Clínica`
4. Padrão: Aplicativo | Gratuito
5. Idioma padrão: Português do Brasil
6. Marque os termos e crie

### 2. Configurar Acesso ao app (antes de ir para prod)
- **App access**: Funcionalidades disponíveis sem login (landing page) + com conta de teste
  - Credenciais visitante: clicar "Entrar como Visitante" na página de login
- **Anúncios**: NÃO — sem anúncios

### 3. Preencher a ficha da loja
Ver arquivo `ficha-loja.md` para todos os textos prontos.

### 4. Classificação de Conteúdo (IARC)
Ver arquivo `content-rating.md` com respostas ao questionário.

### 5. Público-alvo e conteúdo
- Faixa etária: 18+
- NÃO direcionado a crianças

### 6. Data Safety
Ver arquivo `data-safety.md` com todas as respostas.

### 7. Saúde
- Categoria: Ferramentas de saúde usadas por profissionais
- Não é app de diagnóstico nem de tratamento médico

### 8. Upload do AAB
- Arquivo: `android-twa/app/build/outputs/bundle/release/clinicafy-signed.aab`
- OU copie o AAB de `playstore-release/clinicafy/clinicafy-1.0.0-vc1.aab` (se disponível)
- Track: **Produção** (direto, sem teste interno/aberto conforme solicitado)

### 9. Ativar Play App Signing
- Após enviar o AAB, ative o Play App Signing
- Após ativação, pegue o **SHA-256 da App signing key** em:
  - Play Console → Integridade do app → Assinatura de apps
- Adicione esse SHA-256 ao `assetlinks.json` do site além do SHA-256 da upload key:
  - Arquivo: `public/.well-known/assetlinks.json` no repo
  - URL live: https://www.clinicafy.com.br/.well-known/assetlinks.json

### 10. Enviar para revisão
- Depois de preencher todas as seções obrigatórias
- Clique em **Publicar** → **Enviar para revisão**
- Google leva ~3-7 dias para revisão de novo app

---

## Keystore (assinatura)
```
Arquivo:     C:/Users/cspga/.android/clinicafy-upload-keystore.jks
Alias:       upload
Senha:       Clinicafy@2026!Upload
SHA-256:     A6:78:B2:8E:B2:52:29:EF:44:8D:90:C4:E5:37:BB:7F:09:D5:62:9C:B0:1E:9C:43:36:C9:19:04:66:95:D2:58
```
⚠️ **NUNCA commitar o arquivo .jks no repositório**

---

## Rebuild do AAB (se necessário)
```bash
cd android-twa
./gradlew bundleRelease
# Depois assinar:
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore C:/Users/cspga/.android/clinicafy-upload-keystore.jks \
  app/build/outputs/bundle/release/app-release.aab upload
```
