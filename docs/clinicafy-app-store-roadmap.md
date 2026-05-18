# Clinicafy - Roadmap App Stores e Paginas Publicas

Data: 2026-05-18

## Diagnostico do MD recebido

Arquivo analisado: `C:\Users\cspga\Downloads\clinicafy-cadastro-lojas-app.md`

O material esta bom para ASO, mas alguns trechos foram tratados como risco juridico/comercial antes de publicar:

- "Zero glosas" nao pode ser prometido sem integracao real com operadoras, XML TISS validado e retorno de protocolo/glosa.
- "100% aderente ao CFM" precisa revisao juridica e tecnica.
- "TLS 1.3 em repouso" esta tecnicamente incorreto: TLS e para trafego, nao repouso.
- "Servidores no Brasil" precisa comprovacao do provedor/ambiente.
- "Guias geradas automaticamente" hoje existe modulo operacional de guia/PDF/CSV, mas ainda nao existe XML TISS/lote/protocolo automatico.

## Paginas criadas no site

- `/app`
- `/google-play`
- `/app-store`
- `/suporte`
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/seguranca-lgpd`

Tambem devem entrar no sitemap publico e no rodape da landing.

## O que ja existe no produto

- PWA instalavel.
- Login e area privada.
- Dashboard.
- Cadastro de pacientes.
- Agenda.
- Consultas/prontuario.
- Recibos em PDF e exportacoes.
- Guias TISS/TUSS operacionais com Firestore, status e PDF.
- SEO pages programaticas.

## Falta para publicar Google Play

- Gerar AAB assinado.
- Definir se o app sera wrapper nativo/TWA/Capacitor ou PWA empacotado.
- Icone 512x512 sem cantos arredondados.
- Feature graphic 1024x500.
- Screenshots Android reais.
- Conta Google Play Console.
- Questionario de classificacao de conteudo.
- Formulario Data Safety.
- Conta demo para revisao, se necessario.
- Revisao de texto final sem claims nao comprovados.

## Falta para publicar App Store

- Definir wrapper iOS.
- Conta Apple Developer.
- Build iOS via Xcode/Transporter.
- Icone 1024x1024 sem transparencia.
- Screenshots iPhone 6.9 e iPad se suportar iPadOS.
- Privacy Nutrition Labels.
- Decidir modelo de pagamento: Apple IAP ou checkout web, conforme politica aplicavel.
- Conta demo para revisao Apple.
- Notas para revisor explicando SaaS de gestao clinica.

## Falta tecnico/produto antes de prometer nas lojas

- XML TISS real por versao ANS.
- Lote/protocolo/retorno de glosa.
- Auditoria de acesso por usuario.
- Politica formal de retencao/backups.
- Exportacao LGPD por paciente.
- Pagina de subprocessadores/provedores.
- Central de suporte com SLA simples.
- Fluxo de solicitacao de exclusao/correcao de dados.

## Proxima execucao recomendada

1. Criar pacote de assets das lojas a partir das telas reais.
2. Implementar pagina `/excluir-conta` ou fluxo de solicitacao LGPD.
3. Decidir tecnologia de empacotamento mobile.
4. Gerar build Android primeiro, por ser mais rapido.
5. Depois preparar App Store com IAP/politica de pagamento resolvida.
