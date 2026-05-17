import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mpClient } from '../_lib/mp';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  res.status(200).json({
    enabled: !!mpClient,
    publicKey: process.env.MP_PUBLIC_KEY || null,
  });
}
