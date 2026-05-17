import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { PlanId } from './plans';

// Note: ensureFreeSubscription is duplicated in FirebaseProvider as a private helper
// to run automatically at login. This export remains for explicit callers (e.g. onboarding).

export type SubscriptionStatus =
  | 'free'
  | 'pending'
  | 'authorized'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'failed';

export interface Subscription {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  mpPreapprovalId?: string;
  mpPreferenceId?: string;
  mpInitPoint?: string;
  amount: number;
  currency: 'BRL';
  payerEmail?: string;
  createdAt?: any;
  updatedAt?: any;
  nextPaymentDate?: string;
  lastPaymentDate?: string;
}

async function authHeader() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Usuário não autenticado.');
  return { Authorization: `Bearer ${token}` };
}

export async function createCheckoutPreference(plan: PlanId): Promise<{ initPoint: string; preferenceId: string }> {
  const headers = await authHeader();
  const res = await fetch('/api/billing/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao iniciar checkout.');
  }
  return res.json();
}

export async function createSubscriptionPreapproval(plan: PlanId, cardTokenEmail: string): Promise<{ initPoint: string; preapprovalId: string }> {
  const headers = await authHeader();
  const res = await fetch('/api/billing/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ plan, payerEmail: cardTokenEmail }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao criar assinatura.');
  }
  return res.json();
}

export async function cancelSubscription(): Promise<void> {
  const headers = await authHeader();
  const res = await fetch('/api/billing/cancel-subscription', {
    method: 'POST',
    headers: { ...headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao cancelar assinatura.');
  }
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const snap = await getDoc(doc(db, 'subscriptions', userId));
  if (!snap.exists()) return null;
  return snap.data() as Subscription;
}

export async function ensureFreeSubscription(userId: string): Promise<void> {
  const existing = await getSubscription(userId);
  if (existing) return;
  await setDoc(doc(db, 'subscriptions', userId), {
    userId,
    plan: 'basico',
    status: 'free',
    amount: 0,
    currency: 'BRL',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
