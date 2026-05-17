import { MercadoPagoConfig } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN || '';
export const mpClient = accessToken
  ? new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } })
  : null;
export const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET || '';
