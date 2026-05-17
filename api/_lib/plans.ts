// Server-side prices — keep in sync with src/lib/plans.ts
export const PLAN_PRICES = {
  basico: { name: 'Básico', price: 0 },
  profissional: { name: 'Profissional', price: 149 },
  vitalicio: { name: 'Vitalício', price: 2497 },
} as const;

export type PlanKey = keyof typeof PLAN_PRICES;

export function mapPreapprovalStatus(s?: string): string {
  switch (s) {
    case 'authorized': return 'active';
    case 'paused': return 'paused';
    case 'cancelled': return 'cancelled';
    case 'pending': return 'pending';
    default: return s || 'pending';
  }
}

export function inferPlanFromReason(reason: string): PlanKey {
  const r = reason.toLowerCase();
  if (r.includes('vital')) return 'vitalicio';
  if (r.includes('profissional')) return 'profissional';
  return 'basico';
}
