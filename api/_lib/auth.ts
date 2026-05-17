import type { VercelRequest } from '@vercel/node';
import { admin } from './firebase';

export async function verifyAuth(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  if (!admin.apps.length) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export function getAppUrl(req: VercelRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}
