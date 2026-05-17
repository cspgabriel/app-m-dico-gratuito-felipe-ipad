export type PlanId = 'basico' | 'profissional' | 'vitalicio';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  currency: 'BRL';
  description: string;
  features: string[];
  highlighted?: boolean;
  free?: boolean;
  limits: {
    pacientes: number | 'unlimited';
    profissionais: number;
    tissTuss: boolean;
    multiClinica: boolean;
    whatsappEmailMarketing: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 0,
    currency: 'BRL',
    description: 'Plano gratuito permanente para começar a usar no consultório.',
    features: [
      'Até 50 pacientes',
      'Prontuário eletrônico básico',
      'Agenda, consultas e recibos em PDF',
      'Guias TISS/TUSS liberadas',
      'Sem WhatsApp, e-mail ou automação de marketing',
    ],
    free: true,
    limits: {
      pacientes: 50,
      profissionais: 1,
      tissTuss: true,
      multiClinica: false,
      whatsappEmailMarketing: false,
    },
  },
  profissional: {
    id: 'profissional',
    name: 'Profissional',
    price: 149,
    currency: 'BRL',
    description: 'Para consultórios em crescimento que precisam de eficiência.',
    features: [
      'Pacientes Ilimitados',
      'Prontuário eletrônico completo',
      'Guias TISS/TUSS e recibos em PDF',
      'Exportação de documentos do paciente',
      'Controle Financeiro (Fluxo de Caixa)',
      'Sem WhatsApp, e-mail ou automação de marketing',
    ],
    highlighted: true,
    limits: {
      pacientes: 'unlimited',
      profissionais: 1,
      tissTuss: true,
      multiClinica: false,
      whatsappEmailMarketing: false,
    },
  },
  vitalicio: {
    id: 'vitalicio',
    name: 'Vitalício',
    price: 2497,
    currency: 'BRL',
    description: 'Pagamento único para clínicas que querem aquisição própria e canais integrados.',
    features: [
      'Tudo do plano Profissional',
      'Uso vitalício, sem mensalidades',
      'Até 10 profissionais inclusos',
      'WhatsApp e e-mail marketing integrados',
      'Campanhas de reativação e lembretes comerciais',
    ],
    limits: {
      pacientes: 'unlimited',
      profissionais: 10,
      tissTuss: true,
      multiClinica: true,
      whatsappEmailMarketing: true,
    },
  },
};

export const PLAN_LIST: Plan[] = [PLANS.basico, PLANS.profissional, PLANS.vitalicio];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
