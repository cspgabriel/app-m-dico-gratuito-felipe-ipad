import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient, mpWebhookSecret } from '../_lib/mp.js';
import { firestore, admin } from '../_lib/firebase.js';
import { mapPreapprovalStatus, inferPlanFromReason } from '../_lib/plans.js';

// MP signs a manifest (`id:...;request-id:...;ts:...;`), not the body —
// so the default JSON body parser is fine.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!mpClient || !firestore) {
      console.warn('[webhook] MP or Firestore not configured');
      return res.status(200).send('ok');
    }

    // ── Validação de assinatura MercadoPago (OBRIGATÓRIO) ──────────
    // Sem secret configurado = rejeita tudo para evitar fraudes
    if (!mpWebhookSecret) {
      console.error('[webhook] MP_WEBHOOK_SECRET não configurado — rejeitando request');
      return res.status(401).send('webhook secret not configured');
    }

    const sig = (req.headers['x-signature'] as string) || '';
    const requestId = (req.headers['x-request-id'] as string) || '';
    const dataId = (req.query['data.id'] || req.query.id || '') as string;
    const parts = Object.fromEntries(
      sig.split(',').map((p) => { const [k, v] = p.trim().split('='); return [k, v]; })
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) {
      console.warn('[webhook] assinatura ausente ou malformada');
      return res.status(401).send('invalid signature format');
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expected = crypto.createHmac('sha256', mpWebhookSecret).update(manifest).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))) {
      console.warn('[webhook] assinatura inválida — possível fraude');
      return res.status(401).send('invalid signature');
    }
    // ─────────────────────────────────────────────────────────────

    const payload = (req.body || {}) as any;
    const type = payload.type || payload.topic;
    const id = payload.data?.id || payload.id;

    if (!type || !id) return res.status(200).send('ignored');

    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const pa = await new PreApproval(mpClient).get({ id: String(id) });
      const userId = pa.external_reference;
      if (!userId) return res.status(200).send('no external_reference');

      // ── Idempotência: verifica se já processamos este preapprovalId ──
      const existing = await firestore.collection('subscriptions').doc(userId).get();
      if (existing.exists && existing.data()?.mpPreapprovalId === pa.id
          && existing.data()?.status === mapPreapprovalStatus(pa.status)) {
        console.log(`[webhook] preapproval ${pa.id} já processado, ignorando`);
        return res.status(200).send('already processed');
      }

      const plan = pa.reason ? inferPlanFromReason(pa.reason) : 'basico';
      const status = mapPreapprovalStatus(pa.status);

      await firestore.collection('subscriptions').doc(userId).set({
        userId,
        mpPreapprovalId: pa.id,
        status,
        plan,
        amount: pa.auto_recurring?.transaction_amount || 0,
        currency: pa.auto_recurring?.currency_id || 'BRL',
        payerEmail: pa.payer_email,
        nextPaymentDate: pa.next_payment_date,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      await firestore.collection('users').doc(userId).set({
        plan,
        subscriptionStatus: status,
        // Downgrade automático para free se cancelado/suspenso
        ...(status === 'cancelled' || status === 'paused' ? { plan: 'basico' } : {}),
      }, { merge: true });

      console.log(`[webhook] preapproval ${pa.id} — userId=${userId} plan=${plan} status=${status}`);

    } else if (type === 'payment') {
      const payment = await new Payment(mpClient).get({ id: String(id) });
      const userId = payment.external_reference;
      if (!userId) return res.status(200).send('no external_reference');

      // ── Idempotência: verifica se já processamos este paymentId ──
      const existingSub = await firestore.collection('subscriptions').doc(userId).get();
      if (existingSub.exists && existingSub.data()?.lastPaymentId === String(payment.id)
          && existingSub.data()?.status === 'active') {
        console.log(`[webhook] payment ${payment.id} já processado, ignorando`);
        return res.status(200).send('already processed');
      }

      const status = payment.status === 'approved' ? 'active'
                   : payment.status === 'pending'  ? 'pending'
                   : 'failed';

      const selectedPlan = existingSub.data()?.plan || payment.metadata?.plan || 'basico';

      await firestore.collection('subscriptions').doc(userId).set({
        userId,
        plan: selectedPlan,
        status,
        lastPaymentDate: payment.date_approved || payment.date_created,
        lastPaymentId: String(payment.id),
        amount: payment.transaction_amount || 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      if (status === 'active') {
        await firestore.collection('users').doc(userId).set({
          plan: selectedPlan,
          subscriptionStatus: 'active',
        }, { merge: true });
      }

      console.log(`[webhook] payment ${payment.id} — userId=${userId} plan=${selectedPlan} status=${status}`);
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('[webhook]', err);
    // 200 para evitar retry storm em erros transientes do MP
    res.status(200).send('ok');
  }
}
