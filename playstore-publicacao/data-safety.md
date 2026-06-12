# Clinicafy — Data Safety (Segurança dos Dados)

Respostas ao questionário de Segurança de dados da Google Play Console.

---

## Seção 1: Coleta e compartilhamento de dados

**O app coleta ou compartilha dados de usuários?**
✅ Sim — o app coleta dados

---

## Seção 2: Tipos de dados coletados

### Informações pessoais
| Tipo | Coletado? | Finalidade | Obrigatório? |
|------|-----------|------------|--------------|
| Nome | ✅ Sim | Funcionalidade do app | Sim |
| E-mail | ✅ Sim | Autenticação (Firebase) | Sim |
| ID de usuário | ✅ Sim | Conta do usuário | Sim |

### Informações de saúde e condicionamento físico
| Tipo | Coletado? | Finalidade | Obrigatório? |
|------|-----------|------------|--------------|
| Registros de saúde | ✅ Sim | Funcionalidade do app (prontuário) | Sim |

> **Nota:** Os dados de saúde são inseridos pelo profissional (médico) sobre seus pacientes. Os pacientes não são usuários diretos do app — são cadastrados pelo médico.

### Informações financeiras
| Tipo | Coletado? | Finalidade | Obrigatório? |
|------|-----------|------------|--------------|
| Histórico de compras | ✅ Sim | Processamento de pagamentos (planos) | Sim |

---

## Seção 3: Compartilhamento com terceiros

**Os dados são compartilhados com terceiros?**
✅ Sim — com processadores (não vendemos dados)

| Terceiro | Dado compartilhado | Finalidade |
|----------|-------------------|------------|
| Google Firebase | E-mail, ID de usuário | Autenticação e banco de dados |
| Mercado Pago | Informações de pagamento | Processamento de assinatura |
| Hostinger MySQL | Dados clínicos do profissional | Armazenamento do banco de dados |

---

## Seção 4: Práticas de segurança

| Pergunta | Resposta |
|----------|----------|
| Os dados são criptografados em trânsito? | ✅ Sim (HTTPS/TLS) |
| O usuário pode solicitar exclusão dos dados? | ✅ Sim |
| O app segue a política de Família do Google Play? | ❌ Não — não destinado a crianças |

---

## Seção 5: Acesso ao app para revisão

**O app requer login para usar todas as funcionalidades?**
Sim — mas existe modo visitante:
- Na tela de login, clique em **"Entrar como Visitante"**
- O visitante acessa uma conta de demonstração com dados fictícios
- Todas as funcionalidades principais ficam acessíveis

---

## Seção 6: Aplicativos de saúde

**Resposta ao formulário de saúde da Play Console:**
- O app **NÃO** fornece diagnóstico médico
- O app **NÃO** fornece tratamento médico
- O app é uma **ferramenta de gestão/produtividade** para profissionais de saúde (médicos)
- Os dados clínicos são gerenciados pelo profissional, não pelo paciente
