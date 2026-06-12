# Clinicafy — Declarações e Conformidade

---

## Declaração de App de Saúde

O **Clinicafy** é uma **ferramenta de gestão profissional** para médicos e clínicas.

- ✅ É um software de produtividade para profissionais de saúde
- ❌ NÃO fornece diagnóstico médico
- ❌ NÃO substitui consulta ou tratamento médico
- ❌ NÃO é destinado ao uso direto por pacientes (é usado pelo médico)
- ✅ Os dados clínicos são gerenciados exclusivamente pelo profissional de saúde cadastrado

---

## Declaração LGPD (Lei Geral de Proteção de Dados)

O Clinicafy opera em conformidade com a LGPD (Lei nº 13.709/2018):

- **Controlador dos dados:** O médico/clínica que utiliza o sistema
- **Operador:** AgenciAR Digital (fornecedor do software)
- **Base legal:** Execução de contrato (prestação de serviço médico)
- **Finalidade:** Gestão de pacientes e registros clínicos pelo profissional
- **Retenção:** Dados mantidos enquanto a conta estiver ativa
- **Exclusão:** Usuário pode solicitar exclusão pelo e-mail contato@clinicafy.com.br
- **Política de Privacidade:** https://www.clinicafy.com.br/privacidade

---

## Declaração de Pagamentos

O app utiliza **Mercado Pago** para processar pagamentos dos planos:
- Mercado Pago é um processador de pagamentos certificado PCI-DSS
- Os dados de cartão **NÃO** são armazenados pelo Clinicafy
- O app declara: **Sim, possui compras no app** (planos Pro e Vitalício)

---

## Declaração de Anúncios

- O app **NÃO** contém anúncios de terceiros
- O app **NÃO** usa SDKs de publicidade (AdMob, Meta Audience Network, etc.)

---

## Declaração de App Governamental

- O app **NÃO** é um aplicativo governamental oficial
- Não há afiliação com órgãos do governo brasileiro

---

## Assinatura Digital do AAB

```
Package:          br.com.clinicafy.app
Keystore:         clinicafy-upload-keystore.jks
Alias:            upload
Algoritmo:        RSA 2048
SHA-256 (upload): A6:78:B2:8E:B2:52:29:EF:44:8D:90:C4:E5:37:BB:7F:09:D5:62:9C:B0:1E:9C:43:36:C9:19:04:66:95:D2:58
```

---

## Digital Asset Links (assetlinks.json)

Publicado em: https://www.clinicafy.com.br/.well-known/assetlinks.json

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "br.com.clinicafy.app",
    "sha256_cert_fingerprints": [
      "A6:78:B2:8E:B2:52:29:EF:44:8D:90:C4:E5:37:BB:7F:09:D5:62:9C:B0:1E:9C:43:36:C9:19:04:66:95:D2:58"
    ]
  }
}]
```

> ⚠️ **Após ativar o Play App Signing** na Play Console, adicionar o SHA-256 da **App signing key** neste array. Ambos os fingerprints devem estar presentes.
