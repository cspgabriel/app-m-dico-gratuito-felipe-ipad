# Clinicafy — Planos e Funcionalidades

Data: 2026-05-17

## Plano Gratuito

- Preço: R$ 0/mês.
- Até 50 pacientes.
- 1 profissional.
- Prontuário eletrônico básico.
- Agenda e consultas.
- Recibos em PDF.
- Exportação de prontuário do paciente em PDF.
- Guias TISS/TUSS liberadas.
- Sem WhatsApp.
- Sem e-mail marketing.
- Sem automações de marketing.

## Plano Profissional

- Preço: R$ 149/mês.
- Pacientes ilimitados.
- 1 profissional.
- Prontuário completo.
- Guias TISS/TUSS.
- Recibos em PDF.
- Exportação de documentos e histórico do paciente.
- Relatórios e controle financeiro.
- Sem WhatsApp.
- Sem e-mail marketing.
- Sem automações de marketing.

## Plano Vitalício

- Preço: R$ 2.497 pagamento único.
- Sem mensalidades.
- Tudo do Profissional.
- Até 10 profissionais.
- WhatsApp integrado.
- E-mail marketing integrado.
- Campanhas de reativação e lembretes comerciais.
- Indicado para clínicas que querem aquisição própria sem mensalidade.

## Recursos Já Revisados

- PDF de prontuário: existente em `src/lib/pdf-service.ts` e acionado em detalhes do paciente.
- PDF de recibo: existente em `src/lib/receipt-service.ts` e módulo `Recibos`.
- Guias TISS/TUSS: nova tela `/guides`, disponível no plano gratuito, com geração via impressão/PDF e exportação CSV.
- Marketing: bloqueado para Básico/Profissional; exibido apenas para Vitalício.
- Webhook Mercado Pago: pagamento único agora também grava `plan` no usuário quando aprovado.

## Melhorias Recomendadas

- Gerar DOCX do prontuário e da consulta, além do PDF.
- Adicionar botão "Gerar relatório da consulta" dentro da tela de consulta.
- Criar modelo de guia TISS em layout oficial imprimível.
- Criar documentos por paciente: atestado, declaração de comparecimento, solicitação de exame e relatório médico.
- Converter anexos do paciente em um pacote PDF único.
