export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const ALLOWED_CATEGORIES = [
  'tech', 'ai', 'gadgets', 'internet', 'geopolitics', 'global-market', 'conflicts',
  'diplomacy', 'programming', 'web', 'mobile', 'devops', 'games', 'console', 'pc',
  'mobile-gaming', 'trending', 'world-news', 'entertainment', 'lifestyle'
];

export function isWithinLastSevenDays(value, now = Date.now()) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now && timestamp >= now - SEVEN_DAYS_MS;
}

export function filterRecentItems(items, now = Date.now()) {
  return (items || []).filter(item => item?.title && safeHttpsUrl(item.link)
    && isWithinLastSevenDays(item.isoDate || item.pubDate, now));
}

export function safeHttpsUrl(value, allowedHosts) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (allowedHosts && !allowedHosts.includes(url.hostname)) return '';
    return url.href;
  } catch {
    return '';
  }
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function plainText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseArticleJson(rawText) {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const data = JSON.parse(cleaned);
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new Error('A resposta da IA não é um artigo JSON.');
  }
  for (const field of ['title', 'subtitle', 'content', 'excerpt']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw new Error(`Artigo sem campo obrigatório: ${field}.`);
    }
  }
  data.category = ALLOWED_CATEGORIES.includes(data.category) ? data.category : 'trending';
  data.tags = Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string').slice(0, 8) : [];
  return data;
}

export function validateArticleEvidence(article, topic, groundingMetadata, now = Date.now()) {
  if (!filterRecentItems([topic], now).length) throw new Error('A pauta RSS não tem data válida nos últimos 7 dias.');
  if (!isWithinLastSevenDays(article.eventDate, now)) throw new Error('O fato principal está sem data recente válida.');
  const sources = Array.isArray(article.sources) ? article.sources : [];
  if (!sources.length || sources.some(source => !source || !safeHttpsUrl(source.url)
    || !isWithinLastSevenDays(source.publishedAt, now))) {
    throw new Error('A IA deve informar fontes com URL HTTPS e data nos últimos 7 dias.');
  }
  const groundedSources = (groundingMetadata?.groundingChunks || [])
    .map(chunk => chunk.web).filter(web => web && safeHttpsUrl(web.uri));
  if (!groundedSources.length) throw new Error('Nenhuma fonte de pesquisa web foi retornada pelo Gemini.');
  // Datas declaradas pela IA permanecem pendentes de checagem editorial humana.
  return { ...article, groundedSources };
}

export function buildSourceReferences(article, topic, images = []) {
  const lines = [
    `Pauta RSS: ${plainText(topic.title)} | ${topic.isoDate || topic.pubDate} | ${safeHttpsUrl(topic.link)}`,
    `Data do fato declarada pela IA: ${article.eventDate}; confirmar na revisão editorial.`,
    ...(article.sources || []).map(source => `Fonte indicada pela IA (conferir data): ${plainText(source.title)} | ${source.publishedAt} | ${safeHttpsUrl(source.url)}`),
    ...(article.groundedSources || []).map(source => `Pesquisa Gemini: ${plainText(source.title)} | ${safeHttpsUrl(source.uri)}`),
    ...images.map((image, index) => `${index === 0 ? 'Capa' : 'Imagem interna'}: ${image.description} | ${image.credit} | ${image.license} | ${image.sourceUrl}`)
  ];
  if (!images.length) lines.push('Imagem pendente: nenhuma foto com correspondência suficiente foi encontrada.');
  return lines.join('\n');
}

export function buildDraftPayload(article, topic, images = [], now = Date.now(), authorId = 1) {
  validateArticleEvidence(article, topic, {
    groundingChunks: (article.groundedSources || []).map(web => ({ web }))
  }, now);
  let imageIndex = 1;
  const content = article.content.replace(/\[IMAGEM_INTERNA(?:_\d+)?\]/g, () => {
    const image = images[imageIndex++];
    if (!image) return '';
    return `<figure class="my-6 max-w-3xl mx-auto"><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.description)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" class="w-full h-auto rounded-xl" /><figcaption class="text-xs text-neutral-500 mt-2">Imagem de arquivo/ilustrativa: ${escapeHtml(image.description)}. Crédito: ${escapeHtml(image.credit)}. <a href="${escapeHtml(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(image.license)}</a>.</figcaption></figure>`;
  });
  const coverCredit = images[0]
    ? `<p class="text-xs text-neutral-500">Imagem de capa de arquivo/ilustrativa: ${escapeHtml(images[0].description)}. Crédito: ${escapeHtml(images[0].credit)}. <a href="${escapeHtml(images[0].sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(images[0].license)}</a>.</p>`
    : '';
  return {
    title: article.title,
    subtitle: article.subtitle,
    content: content + coverCredit,
    excerpt: article.excerpt,
    category: article.category,
    tags: article.tags,
    imageUrl: images[0]?.url || '',
    authorId,
    isDraft: true,
    featured: false,
    aiAssisted: true,
    sourceReferences: buildSourceReferences(article, topic, images),
    reviewedBy: '',
    factChecked: false,
    rightsCleared: false,
    sensitiveContentReviewed: false
  };
}

export function buildTelegramNotification(article, siteUrl = 'https://alpesnews.vercel.app') {
  const baseUrl = safeHttpsUrl(siteUrl);
  if (!baseUrl) throw new Error('SITE_URL deve ser uma URL HTTPS válida.');
  const id = String(article.id ?? '');
  if (!/^[1-9]\d*$/.test(id)) throw new Error('Rascunho salvo sem ID válido para prévia privada.');
  const origin = new URL(baseUrl).origin;
  return {
    text: `🤖 <b>Rascunho pronto para revisão</b>\n\n<b>${escapeHtml(plainText(article.title).slice(0, 220))}</b>\n\n${escapeHtml(plainText(article.subtitle || article.excerpt).slice(0, 700))}\n\nCategoria: ${escapeHtml(article.category)}\n${article.imageUrl ? '🖼 Foto de arquivo/ilustrativa selecionada; confira a relação com a notícia.' : '🖼 Imagem pendente: escolha uma foto no editor.'}\n\nAbra a prévia privada, entre com sua conta autorizada e revise antes de publicar.`,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [{ text: '👁 Ver prévia privada', url: `${origin}/admin/articles/${id}/preview` }],
        [{ text: '✏️ Editar matéria', url: `${origin}/admin/article/edit/${id}` }]
      ]
    }
  };
}
