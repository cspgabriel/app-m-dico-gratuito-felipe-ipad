export type PlanId = 'basico' | 'profissional' | 'multi';

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
    iaAnamnese: boolean;
    tissTuss: boolean;
    multiClinica: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 0,
    currency: 'BRL',
    description: 'Perfeito para estudantes e residentes que estão começando.',
    features: [
      'Até 50 pacientes',
      'Prontuário eletrônico básico',
      'Prescrição digital simples',
      'Suporte por e-mail',
    ],
    free: true,
    limits: {
      pacientes: 50,
      profissionais: 1,
      iaAnamnese: false,
      tissTuss: false,
      multiClinica: false,
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
      'Prontuário com Anamnese em IA (Beta)',
      'Faturamento TISS/TUSS Automático',
      'Controle Financeiro (Fluxo de Caixa)',
    ],
    highlighted: true,
    limits: {
      pacientes: 'unlimited',
      profissionais: 1,
      iaAnamnese: true,
      tissTuss: true,
      multiClinica: false,
    },
  },
  multi: {
    id: 'multi',
    name: 'Multi-Clínicas',
    price: 349,
    currency: 'BRL',
    description: 'Para clínicas com vários profissionais, recepção e gestão.',
    features: [
      'Tudo do plano Profissional',
      'Até 10 Profissionais Inclusos',
      'Níveis de permissão Granulares',
      'Repasses e Split de Pagamentos',
    ],
    limits: {
      pacientes: 'unlimited',
      profissionais: 10,
      iaAnamnese: true,
      tissTuss: true,
      multiClinica: true,
    },
  },
};

export const PLAN_LIST: Plan[] = [PLANS.basico, PLANS.profissional, PLANS.multi];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
