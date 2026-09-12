import { createHmac } from 'node:crypto';

// A chave derivada autentica somente o webhook; o token do bot nunca é enviado ao site.
export function getWebhookSecret(env = process.env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) return env.TELEGRAM_WEBHOOK_SECRET;
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  return createHmac('sha256', env.TELEGRAM_BOT_TOKEN)
    .update('alpesnews:telegram-webhook:v1')
    .digest('hex');
}
