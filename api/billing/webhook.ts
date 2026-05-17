import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient, mpWebhookSecret } from '../_lib/mp';
import { firestore, admin } from '../_lib/firebase';
import { mapPreapprovalStatus, inferPlanFromReason } from '../_lib/plans';

// MP signs a manifest (`id:...;request-id:...;ts:...;`), not the body —
// so the default JSON body parser is fine.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!mpClient || !firestore) {
      console.warn('[webhook] MP or Firestore not configured');
      return res.status(200).send('ok');
    }

    if (mpWebhookSecret) {
      const sig = (req.headers['x-signature'] as string) || '';
      const requestId = (req.headers['x-request-id'] as string) || '';
      const parts = Object.fromEntries(sig.split(',').map((p) => p.trim().split('=')));
      const ts = parts['ts'];
      const v1 = parts['v1'];
      const dataId = (req.query['data.id'] || req.query.id || '') as string;
      if (ts && v1) {
        const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
        const expected = crypto.createHmac('sha256', mpWebhookSecret).update(manifest).digest('hex');
        if (expected !== v1) {
          console.warn('[webhook] invalid signature');
          return res.status(401).send('invalid signature');
        }
      }
    }

    const payload = (req.body || {}) as any;
    const type = payload.type || payload.topic;
    const id = payload.data?.id || payload.id;

    if (!type || !id) return res.status(200).send('ignored');

    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const pa = await new PreApproval(mpClient).get({ id: String(id) });
      const userId = pa.external_reference;
      if (userId) {
        const plan = pa.reason ? inferPlanFromReason(pa.reason) : 'basico';
        await firestore.collection('subscriptions').doc(userId).set({
          userId,
          mpPreapprovalId: pa.id,
          status: mapPreapprovalStatus(pa.status),
          plan,
          amount: pa.auto_recurring?.transaction_amount || 0,
          currency: pa.auto_recurring?.currency_id || 'BRL',
          payerEmail: pa.payer_email,
          nextPaymentDate: pa.next_payment_date,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await firestore.collection('users').doc(userId).set({
          plan,
          subscriptionStatus: mapPreapprovalStatus(pa.status),
        }, { merge: true });
      }
    } else if (type === 'payment') {
      const payment = await new Payment(mpClient).get({ id: String(id) });
      const userId = payment.external_reference;
      if (userId) {
        const status = payment.status === 'approved' ? 'active' : payment.status === 'pending' ? 'pending' : 'failed';
        const currentSub = await firestore.collection('subscriptions').doc(userId).get();
        const selectedPlan = currentSub.data()?.plan || payment.metadata?.plan || 'basico';
        await firestore.collection('subscriptions').doc(userId).set({
          userId,
          plan: selectedPlan,
          status,
          lastPaymentDate: payment.date_approved || payment.date_created,
          lastPaymentId: payment.id,
          amount: payment.transaction_amount || 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        if (status === 'active') {
          await firestore.collection('users').doc(userId).set({ plan: selectedPlan, subscriptionStatus: 'active' }, { merge: true });
        }
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('[webhook]', err);
    // 200 to avoid retry storm on transient errors
    res.status(200).send('ok');
  }
}
