import { useAuth } from '../components/FirebaseProvider';
import { PLANS, type PlanId } from './plans';

export interface Entitlements {
  planId: PlanId;
  planName: string;
  status: string;
  isActive: boolean;
  isFree: boolean;
  maxPacientes: number | 'unlimited';
  maxProfissionais: number;
  canUseAI: boolean;
  canUseTiss: boolean;
  canMultiClinica: boolean;
  canManageBilling: boolean;
}

/**
 * Source of truth for client-side permission checks.
 * Server-side enforcement (Firestore rules, webhooks) still applies — this is for UX only.
 */
export function usePlan(): Entitlements {
  const { userProfile } = useAuth();
  const planId: PlanId = (userProfile?.plan as PlanId) || 'basico';
  const plan = PLANS[planId] || PLANS.basico;
  const status = userProfile?.subscriptionStatus || 'free';
  const isActive = status === 'active' || status === 'authorized' || status === 'free';
  const role = userProfile?.role || 'admin';

  return {
    planId,
    planName: plan.name,
    status,
    isActive,
    isFree: !!plan.free,
    maxPacientes: plan.limits.pacientes,
    maxProfissionais: plan.limits.profissionais,
    canUseAI: plan.limits.iaAnamnese && isActive,
    canUseTiss: plan.limits.tissTuss && isActive,
    canMultiClinica: plan.limits.multiClinica && isActive,
    canManageBilling: role === 'admin',
  };
}

export function checkPatientLimit(currentCount: number, max: number | 'unlimited'): { allowed: boolean; remaining: number | 'unlimited' } {
  if (max === 'unlimited') return { allowed: true, remaining: 'unlimited' };
  return { allowed: currentCount < max, remaining: Math.max(0, max - currentCount) };
}
