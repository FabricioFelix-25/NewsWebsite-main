import { GoogleGenAI } from '@google/genai';
import { collectArticleImages } from '../server/lib/images.js';
import { safeHttpsUrl } from '../server/lib/editorial.js';
import { prepareImagePlan } from '../server/lib/image-plan.js';

export const config = { maxDuration: 120 };
const recentSearches = new Map();

export async function suggestImageDirective(ai, article) {
  return prepareImagePlan(ai, article);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }); }
  const authorization = req.headers?.authorization;
  if (typeof authorization !== 'string' || !/^Bearer \S{1,8000}$/.test(authorization)) return res.status(401).json({ error: 'Entre no painel para buscar imagens.' });
  try {
    const apiUrl = process.env.NEWSPORTAL_API_URL || 'https://api-newsportal.onrender.com/api/articles';
    if (!safeHttpsUrl(apiUrl)) throw new Error('API inválida.');
    const response = await fetch(apiUrl.replace(/\/articles\/?$/, '') + '/auth/me', {
      headers: { Authorization: authorization }, redirect: 'error', signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      if (![401, 403].includes(response.status)) throw new Error('Autenticação temporariamente indisponível.');
      return res.status(response.status).json({ error: 'Sessão expirada. Entre novamente no painel.' });
    }
    const user = await response.json();
    if (!['ADMIN', 'EDITOR'].includes(user.role)) return res.status(403).json({ error: 'Acesso restrito à equipe editorial.' });
    const body = req.body;
    if (!body || typeof body.title !== 'string' || !body.title.trim() || body.title.length > 500
      || typeof body.content !== 'string' || body.content.length > 100000
      || (body.query !== undefined && (typeof body.query !== 'string' || body.query.length > 180))
      || (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 12
        || body.tags.some(tag => typeof tag !== 'string' || tag.length > 100)))) {
      return res.status(400).json({ error: 'Informe o título e o texto da matéria.' });
    }
    const now = Date.now();
    for (const [id, time] of recentSearches) if (now - time > 30000) recentSearches.delete(id);
    if (recentSearches.has(user.id)) return res.status(429).json({ error: 'Aguarde alguns segundos antes de buscar novamente.' });
    recentSearches.set(user.id, now);
    const query = body.query?.trim();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const directive = await suggestImageDirective(ai, body);
    const images = await collectArticleImages(directive, { pexelsApiKey: process.env.PEXELS_API_KEY, count: 4,
      article: body, ai, plan: directive, queryOverride: query });
    return res.status(200).json({ subject: directive.subject, images });
  } catch {
    return res.status(503).json({ error: 'A busca não foi concluída. Tente novamente ou informe o assunto da foto.' });
  }
}
