import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PreApproval } from 'mercadopago';
import { mpClient } from '../_lib/mp';
import { firestore, admin } from '../_lib/firebase';
import { verifyAuth } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (!mpClient || !firestore) return res.status(503).json({ error: 'Serviço indisponível.' });
    const decoded = await verifyAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Não autenticado.' });

    const subSnap = await firestore.collection('subscriptions').doc(decoded.uid).get();
    const sub = subSnap.data();
    if (!sub?.mpPreapprovalId) return res.status(404).json({ error: 'Assinatura não encontrada.' });

    await new PreApproval(mpClient).update({
      id: sub.mpPreapprovalId,
      body: { status: 'cancelled' },
    });

    await firestore.collection('subscriptions').doc(decoded.uid).set({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await firestore.collection('users').doc(decoded.uid).set({
      subscriptionStatus: 'cancelled',
      plan: 'basico',
    }, { merge: true });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[cancel-subscription]', err);
    res.status(500).json({ error: 'Falha ao cancelar assinatura.' });
  }
}
