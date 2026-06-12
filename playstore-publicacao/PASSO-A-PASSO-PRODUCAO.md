# Clinicafy — Passo a passo até PRODUÇÃO na Google Play

> App: **Clinicafy: Gestão de Clínica** · Package `br.com.clinicafy.app`
> Conta dev: AgenciAR Digital · App **ainda precisa ser criado** na Play Console.
> Objetivo: publicar a **1ª versão direto em Produção** (pular teste interno e aberto).

## Pré-requisitos (já prontos neste repo)
- `clinicafy-1.0.0-vc1.aab` — bundle assinado (upload key)
- `assets/icon-512.png` — ícone 512×512
- `assets/feature-graphic.png` — imagem de destaque 1024×500
- `screenshots/` — capturas de tela
- `ficha-loja.md` — textos (título, descrição curta e completa)
- Keystore: `C:/Users/cspga/.android/clinicafy-upload-keystore.jks` (alias `upload`)
- **Senha do keystore:** `Clinicafy@2026!Upload` (GUARDAR — necessária pra updates)
- Upload key SHA-256: `A6:78:B2:8E:B2:52:29:EF:44:8D:90:C4:E5:37:BB:7F:09:D5:62:9C:B0:1E:9C:43:36:C9:19:04:66:95:D2:58`

## ⚠️ Antes de publicar: o app PRECISA estar funcional
Migração Firebase→MySQL (já aplicado por este agente):
1. ✅ Tabelas MySQL criadas com prefixo `clinic_` (`prisma db push`)
2. ✅ `DATABASE_URL` adicionada nas env vars de Produção da Vercel
3. ⚠️ **Hostinger Remote MySQL**: mesmo banco compartilhado do NutriFoco
   (`u306535956_agenciar`). Se `/api/pacientes` der 500, liberar o IP da Vercel
   no painel Hostinger → Remote MySQL (host `%` ou range Vercel).

## Passo a passo na Play Console

### 1. Criar o app
- Play Console → **Create app**
- Nome: `Clinicafy: Gestão de Clínica` · Idioma padrão: Português (Brasil)
- Tipo: App · Gratuito
- Marcar as 2 declarações (Developer Program Policies + US export laws)

### 2. App content (Política do app)
- Política de privacidade: `https://www.clinicafy.com.br/privacidade`
- Acesso ao app: login Google / e-mail; descrever que cria conta FREE
- Anúncios: Não
- Classificação IARC: utilitário/médico → Livre/14+
- Público-alvo: 18+
- Data safety: coleta nome/email/saúde/financeiro (recibos), criptografado, não compartilha
- Government apps: Não · Financial features: Nenhum · Health apps: Gestão médica

### 3. Ficha da loja — usar `ficha-loja.md`
- Ícone `assets/icon-512.png`, destaque `assets/feature-graphic.png`, screenshots

### 4. Release de PRODUÇÃO (pular testes)
1. Test and release → **Production** → **Create new release**
2. Aceitar **Play App Signing**
3. Upload `clinicafy-1.0.0-vc1.aab`
4. Release notes: "Primeira versão do Clinicafy."
5. Review → **Start rollout to Production** → enviar pra revisão

### 5. PÓS-publicação (assetlinks)
Copiar SHA-256 da App signing key (Play Console → Integridade do app) e
adicionar ao `public/.well-known/assetlinks.json`, commitar e deployar.
