import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Preference } from 'mercadopago';
import { mpClient } from '../_lib/mp';
import { firestore, admin } from '../_lib/firebase';
import { verifyAuth, getAppUrl } from '../_lib/auth';
import { PLAN_PRICES, type PlanKey } from '../_lib/plans';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!mpClient) return res.status(503).json({ error: 'Mercado Pago não configurado.' });
    const decoded = await verifyAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Não autenticado.' });

    const { plan } = (req.body || {}) as { plan?: string };
    const planDef = plan ? PLAN_PRICES[plan as PlanKey] : undefined;
    if (!planDef || planDef.price <= 0) return res.status(400).json({ error: 'Plano inválido.' });

    const appUrl = getAppUrl(req);
    const preference = await new Preference(mpClient).create({
      body: {
        items: [
          {
            id: plan!,
            title: `MedSystem — Plano ${planDef.name}`,
            description: `Assinatura mensal do plano ${planDef.name}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: planDef.price,
          },
        ],
        payer: { email: decoded.email || undefined },
        external_reference: decoded.uid,
        metadata: { userId: decoded.uid, plan },
        back_urls: {
          success: `${appUrl}/billing/success?plan=${plan}`,
          failure: `${appUrl}/billing/failure?plan=${plan}`,
          pending: `${appUrl}/billing/pending?plan=${plan}`,
        },
        auto_return: 'approved',
        statement_descriptor: 'MEDSYSTEM',
        notification_url: `${appUrl}/api/billing/webhook`,
      },
    });

    if (firestore) {
      await firestore.collection('subscriptions').doc(decoded.uid).set({
        userId: decoded.uid,
        plan,
        status: 'pending',
        mpPreferenceId: preference.id,
        mpInitPoint: preference.init_point,
        amount: planDef.price,
        currency: 'BRL',
        payerEmail: decoded.email || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    res.status(200).json({ initPoint: preference.init_point, preferenceId: preference.id });
  } catch (err) {
    console.error('[create-preference]', err);
    res.status(500).json({ error: 'Falha ao criar preferência.' });
  }
}
