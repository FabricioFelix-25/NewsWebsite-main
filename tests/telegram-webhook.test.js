// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sdk: vi.fn(),
  classify: vi.fn(),
  parser: vi.fn(),
  parseURL: vi.fn(),
  generateArticle: vi.fn(),
  collectArticleImages: vi.fn(),
  fetch: vi.fn(),
}));

// Todos os pontos que poderiam acessar a rede são substituídos antes de importar o webhook.
vi.mock('@google/genai', () => ({
  GoogleGenAI: function (options) {
    mocks.sdk(options);
    return { models: { generateContent: mocks.classify } };
  },
}));
vi.mock('rss-parser', () => ({
  default: function (options) {
    mocks.parser(options);
    return { parseURL: mocks.parseURL };
  },
}));
vi.mock('../server/lib/generation.js', () => ({ generateArticle: mocks.generateArticle }));
vi.mock('../server/lib/images.js', () => ({ collectArticleImages: mocks.collectArticleImages }));

const NOW = Date.parse('2026-09-11T14:00:00Z');
const RECENT = '2026-09-10T12:00:00Z';
const API_URL = 'https://backend.invalid/api/articles';
const TELEGRAM_URL = 'https://api.telegram.org/botoffline-test-token/sendMessage';
const SECRET = 'offline-webhook-secret';
const topic = {
  title: 'Empresa anuncia produto',
  link: 'https://source.invalid/noticia',
  isoDate: RECENT,
};
const article = {
  title: 'Empresa & parceiros anunciam produto',
  subtitle: 'Resumo para revisão',
  excerpt: 'Resumo recente',
  content: '<p>Notícia com fonte recente.</p>[IMAGEM_INTERNA]',
  category: 'tech',
  tags: ['produto'],
  eventDate: RECENT,
  sources: [{ title: 'Fonte consultada', url: topic.link, publishedAt: RECENT }],
  groundedSources: [{ title: 'Fonte consultada', uri: topic.link }],
  imageDirective: { query: 'Produto', subject: 'Produto', allowStock: false },
  // A IA não pode definir revisão concluída nem transformar a criação em publicação.
  isDraft: false,
  factChecked: true,
  rightsCleared: true,
  sensitiveContentReviewed: true,
  reviewedBy: 'IA',
};

let handler;

function request(overrides = {}) {
  return {
    method: 'POST',
    headers: { 'x-telegram-bot-api-secret-token': SECRET },
    body: { update_id: 101, message: { text: 'Escreva uma matéria sobre o produto', chat: { id: 987 }, from: { id: 654 } } },
    ...overrides,
  };
}

function response() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
}

function outgoingTo(url) {
  return mocks.fetch.mock.calls.filter(([target]) => target === url);
}

function expectNoOutgoing() {
  for (const mock of Object.values(mocks)) expect(mock).not.toHaveBeenCalled();
}

beforeEach(async () => {
  vi.resetModules(); // O armazenamento em memória de update_id inicia limpo em cada cenário.
  vi.resetAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
  vi.stubGlobal('fetch', mocks.fetch);
  for (const [key, value] of Object.entries({
    TELEGRAM_WEBHOOK_SECRET: SECRET,
    TELEGRAM_BOT_TOKEN: 'offline-test-token',
    TELEGRAM_CHAT_ID: '987',
    TELEGRAM_USER_ID: '',
    GEMINI_API_KEY: 'offline-test-gemini',
    APP_AI_API_KEY: 'offline-test-backend',
    PEXELS_API_KEY: '',
    NEWSPORTAL_API_URL: API_URL,
    SITE_URL: 'https://alpesnews.vercel.app',
    BOT_AUTHOR_ID: '1',
  })) vi.stubEnv(key, value);
  mocks.classify.mockResolvedValue({ text: JSON.stringify({ intent: 'WRITE_ARTICLE', topic: 'Produto' }) });
  mocks.parseURL.mockResolvedValue({ items: [topic] });
  mocks.generateArticle.mockResolvedValue(article);
  mocks.collectArticleImages.mockResolvedValue([]);
  mocks.fetch.mockImplementation(async url => {
    if (url === API_URL) return { ok: true, json: async () => ({ id: 784 }) };
    if (url === TELEGRAM_URL) return { ok: true, json: async () => ({ ok: true }) };
    throw new Error('Requisição inesperada bloqueada pelo teste offline.');
  });
  ({ default: handler } = await import('../api/telegram.js'));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('autorização do webhook sem acesso a serviços externos', () => {
  it('recusa secret ausente na configuração antes de qualquer saída', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', '');
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    const res = response();
    await handler(request(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expectNoOutgoing();
  });


  it('usa segredo derivado no servidor sem aceitar o token original como header', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', '');
    const { getWebhookSecret } = await import('../server/lib/webhook-auth.js');
    const derived = getWebhookSecret();
    const rejected = response();
    await handler(request({ headers: { 'x-telegram-bot-api-secret-token': process.env.TELEGRAM_BOT_TOKEN }, body: {} }), rejected);
    expect(rejected.status).toHaveBeenCalledWith(401);
    const accepted = response();
    await handler(request({ headers: { 'x-telegram-bot-api-secret-token': derived }, body: {} }), accepted);
    expect(accepted.json).toHaveBeenCalledWith({ status: 'ignored' });
    expectNoOutgoing();
  });

  it.each([
    {},
    { 'x-telegram-bot-api-secret-token': 'secret-curto' },
    { 'x-telegram-bot-api-secret-token': 'x'.repeat(SECRET.length) },
    { 'x-telegram-bot-api-secret-token': [SECRET] },
  ])('recusa header ausente, incorreto ou com tipo inesperado: %j', async headers => {
    const res = response();
    await handler(request({ headers }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expectNoOutgoing();
  });

  it('ignora chat não autorizado sem responder a ele', async () => {
    const req = request();
    req.body.message.chat.id = 123;
    const res = response();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'ignored' });
    expectNoOutgoing();
  });

  it('ignora remetente não autorizado quando TELEGRAM_USER_ID está configurado', async () => {
    vi.stubEnv('TELEGRAM_USER_ID', '321');
    const res = response();
    await handler(request(), res);
    expect(res.json).toHaveBeenCalledWith({ status: 'ignored' });
    expectNoOutgoing();
  });

  it('recusa update_id inválido antes de gerar ou responder', async () => {
    const req = request();
    req.body.update_id = '101';
    const res = response();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expectNoOutgoing();
  });
});

describe('criação e revisão de rascunhos', () => {
  it('salva rascunho com checklist pendente e envia links usando o ID persistido', async () => {
    const res = response();
    await handler(request(), res);

    expect(res.json).toHaveBeenCalledWith({ status: 'draft_saved', articleId: 784 });
    expect(mocks.collectArticleImages).toHaveBeenCalledWith(article.imageDirective,
      expect.objectContaining({ article, ai: expect.any(Object) }));
    const saveCalls = outgoingTo(API_URL);
    expect(saveCalls).toHaveLength(1);
    expect(saveCalls[0][1].method).toBe('POST');
    const payload = JSON.parse(saveCalls[0][1].body);
    expect(payload).toMatchObject({
      isDraft: true,
      featured: false,
      aiAssisted: true,
      factChecked: false,
      rightsCleared: false,
      sensitiveContentReviewed: false,
      reviewedBy: '',
      imageUrl: '',
    });
    expect(payload.content).not.toContain('[IMAGEM_INTERNA]');
    expect(payload.sourceReferences).toContain('Imagem pendente');
    const notification = outgoingTo(TELEGRAM_URL).map(([, options]) => JSON.parse(options.body)).find(body => body.reply_markup);
    expect(notification.parse_mode).toBe('HTML');
    expect(notification.text).toContain('Empresa &amp; parceiros');
    expect(notification.reply_markup.inline_keyboard.flat().map(button => button.url)).toEqual([
      'https://alpesnews.vercel.app/admin/articles/784/preview',
      'https://alpesnews.vercel.app/admin/article/edit/784',
    ]);
    expect(JSON.stringify(notification)).not.toContain('offline-test-');
  });

  it('não gera novamente quando o mesmo update chega depois da conclusão', async () => {
    await handler(request(), response());
    const second = response();
    await handler(request(), second);
    expect(second.json).toHaveBeenCalledWith({ status: 'duplicate' });
    expect(mocks.generateArticle).toHaveBeenCalledTimes(1);
    expect(outgoingTo(API_URL)).toHaveLength(1);
    expect(outgoingTo(TELEGRAM_URL)).toHaveLength(2);
  });

  it('bloqueia entrega duplicada também enquanto a primeira ainda está processando', async () => {
    let finishClassification;
    mocks.classify.mockReturnValue(new Promise(resolve => { finishClassification = resolve; }));
    const firstResponse = response();
    const first = handler(request(), firstResponse);
    const second = response();
    await handler(request(), second);
    expect(second.json).toHaveBeenCalledWith({ status: 'duplicate' });
    finishClassification({ text: JSON.stringify({ intent: 'WRITE_ARTICLE', topic: 'Produto' }) });
    await first;
    expect(firstResponse.json).toHaveBeenCalledWith({ status: 'draft_saved', articleId: 784 });
    expect(outgoingTo(API_URL)).toHaveLength(1);
  });

  it('falha de notificação após salvar não repete POST nem gera outro rascunho', async () => {
    mocks.fetch.mockImplementation(async (url, options) => {
      if (url === API_URL) return { ok: true, json: async () => ({ id: 784 }) };
      if (url === TELEGRAM_URL) {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ ok: !body.reply_markup }) };
      }
      throw new Error('Requisição inesperada bloqueada.');
    });
    const first = response();
    await handler(request(), first);
    expect(first.json).toHaveBeenCalledWith({ status: 'notification_failed' });
    const telegramBodies = outgoingTo(TELEGRAM_URL).map(([, options]) => JSON.parse(options.body));
    expect(telegramBodies.at(-1).text).toContain('O rascunho 784 foi salvo');
    const retry = response();
    await handler(request(), retry);
    expect(retry.json).toHaveBeenCalledWith({ status: 'duplicate' });
    expect(outgoingTo(API_URL)).toHaveLength(1);
    expect(mocks.generateArticle).toHaveBeenCalledTimes(1);
  });

  it('não salva matéria quando o RSS só retorna notícia antiga', async () => {
    mocks.parseURL.mockResolvedValue({ items: [{ ...topic, isoDate: '2026-08-01T12:00:00Z' }] });
    const res = response();
    await handler(request(), res);
    expect(res.json).toHaveBeenCalledWith({ status: 'processing_failed' });
    expect(mocks.generateArticle).not.toHaveBeenCalled();
    expect(mocks.collectArticleImages).not.toHaveBeenCalled();
    expect(outgoingTo(API_URL)).toHaveLength(0);
  });
});
