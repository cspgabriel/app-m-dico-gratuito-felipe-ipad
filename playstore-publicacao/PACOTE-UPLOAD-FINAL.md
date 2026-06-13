# Clinicafy - Pacote final Play Store

App: Clinicafy: Gestao Medica
Package: br.com.clinicafy.app
Play Console app id: 4972170025770637934

## Upload obrigatorio

1. Store listing
   - App icon: `assets/icon-512.png` (512x512)
   - Feature graphic: `assets/feature-graphic.png` (1024x500)
   - Phone screenshots:
     - `screenshots/iphone-screen-1.png`
     - `screenshots/iphone-screen-2.png`
   - 7-inch tablet screenshot:
     - `screenshots/tablet-7-inch-screen-1.png`
   - 10-inch tablet screenshot:
     - `screenshots/tablet-10-inch-screen-1.png`

2. Production release
   - AAB: `clinicafy-1.0.0-vc1.aab`
   - Release name: `1.0.0 (1)`
   - Release notes: `Primeira versao do Clinicafy.`

3. Envio
   - Review release
   - Start rollout to Production
   - Rollout: 100%

## Evidencia tecnica

- Package no Gradle: `br.com.clinicafy.app`
- Version code: `1`
- Version name: `1.0.0`
- AAB contem `base/manifest/AndroidManifest.xml` e `BundleConfig.pb`
- AAB em `release/android/Clinicafy-1.0.0-v1.aab` e `playstore-publicacao/clinicafy-1.0.0-vc1.aab` tem o mesmo SHA-256:
  `53DAC5F56FDB8161A7E35440B6248CE6D12A420EE832D4D46ABBBC92254F95B0`

## Observacao

APK assinado nao foi gerado nesta etapa; para Play Store o AAB e o artefato exigido.
