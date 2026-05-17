import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PreApproval } from 'mercadopago';
import { mpClient } from '../_lib/mp';
import { firestore, admin } from '../_lib/firebase';
import { verifyAuth, getAppUrl } from '../_lib/auth';
import { PLAN_PRICES, mapPreapprovalStatus, type PlanKey } from '../_lib/plans';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!mpClient) return res.status(503).json({ error: 'Mercado Pago não configurado.' });
    const decoded = await verifyAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Não autenticado.' });

    const { plan, payerEmail } = (req.body || {}) as { plan?: string; payerEmail?: string };
    const planDef = plan ? PLAN_PRICES[plan as PlanKey] : undefined;
    if (!planDef || planDef.price <= 0) return res.status(400).json({ error: 'Plano inválido.' });

    const email = payerEmail || decoded.email;
    if (!email) return res.status(400).json({ error: 'E-mail do pagador é obrigatório.' });

    const appUrl = getAppUrl(req);
    const preapproval = await new PreApproval(mpClient).create({
      body: {
        reason: `MedSystem — Plano ${planDef.name}`,
        external_reference: decoded.uid,
        payer_email: email,
        back_url: `${appUrl}/#/billing/success?plan=${plan}`,
        status: 'pending',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planDef.price,
          currency_id: 'BRL',
        },
      },
    });

    if (firestore) {
      await firestore.collection('subscriptions').doc(decoded.uid).set({
        userId: decoded.uid,
        plan,
        status: mapPreapprovalStatus(preapproval.status),
        mpPreapprovalId: preapproval.id,
        mpInitPoint: preapproval.init_point,
        amount: planDef.price,
        currency: 'BRL',
        payerEmail: email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    res.status(200).json({ initPoint: preapproval.init_point, preapprovalId: preapproval.id });
  } catch (err) {
    console.error('[create-subscription]', err);
    res.status(500).json({ error: 'Falha ao criar assinatura.' });
  }
}
