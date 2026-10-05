// Local UI fixture. No production connection, credentials or persistent storage.
import http from 'node:http';

const author = { id: 1, name: 'Editor de teste', email: 'editor@alpes.test', bio: 'Redação de demonstração', avatarUrl: '' };
const base = {
  id: 42, slug: 'demonstracao-revisao-privada', title: 'AlpesNews: demonstração da revisão privada',
  subtitle: 'Uma matéria fictícia para conferir a leitura, a edição e a publicação em ambiente local.',
  excerpt: 'Conteúdo de teste, sem publicação no site real.',
  content: '<p>Esta é uma <strong>matéria fictícia</strong> usada exclusivamente para testar o portal.</p><h3>Uma leitura contínua</h3><p>A matéria principal aparece sem esperar pelas sugestões de leitura.</p><blockquote>O editor pode conferir o texto completo antes de publicar.</blockquote><h3>O que conferir</h3><ul><li>Fatos e datas das fontes.</li><li>Relação das imagens com o conteúdo.</li><li>Créditos e direitos de uso.</li></ul>',
  category: 'tech', tags: ['teste', 'editorial'], authorId: 1, author,
  imageUrl: 'http://127.0.0.1:19090/media/cover.svg',
  publishedAt: null, updatedAt: '2026-09-11T12:00:00Z', isDraft: true, featured: false,
  aiAssisted: true, sourceReferences: 'Fonte fictícia para teste local. Nenhuma notícia real.',
  factChecked: false, rightsCleared: false, sensitiveContentReviewed: false, reviewedBy: '',
};
let draft = { ...base };
const published = Array.from({ length: 6 }, (_, i) => ({ ...base, id: i + 1, title: `Notícia de demonstração ${i + 1}`, slug: `demonstracao-${i + 1}`, publishedAt: '2026-09-11T12:00:00Z', isDraft: false, featured: i < 3, category: ['tech', 'ai', 'games'][i % 3] }));
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5174');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  if (req.method === 'OPTIONS') return send(200, {});
  const url = new URL(req.url, 'http://127.0.0.1:19090');
  const path = url.pathname.replace(/^\/api/, '');
  const authenticated = req.headers.authorization === 'Bearer local-ui-fixture';
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let body = {};
  try { if (chunks.length) body = JSON.parse(Buffer.concat(chunks).toString()); } catch { return send(400, {}); }
  if (path === '/media/cover.svg') {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#163c48"/><path d="M0 900L540 170L1020 900Z" fill="#356478"/><path d="M460 900L1110 110L1600 900Z" fill="#628591"/><text x="80" y="800" fill="white" font-family="sans-serif" font-size="55">ALPESNEWS · IMAGEM DE TESTE</text></svg>');
  }
  if (path === '/auth/login') return body.email === 'editor@alpes.test' && body.password === 'revisao-local' ? send(200, { ...author, role: 'ADMIN', token: 'local-ui-fixture' }) : send(401, { message: 'Credenciais de teste inválidas.' });
  if (path === '/auth/me') return authenticated ? send(200, { ...author, role: 'ADMIN' }) : send(401, {});
  if (path === '/editor-images') return authenticated ? send(200, { subject: 'Demonstração editorial', images: [
    { url: 'http://127.0.0.1:19090/media/cover.svg', sourceUrl: 'https://example.test/foto', title: 'Foto de demonstração', description: 'Ilustração de teste local', credit: 'Redação de teste', license: 'Uso demonstrativo', width: 1600, height: 900 }
  ] }) : send(401, {});
  if (path === '/articles/admin/42/preview') return authenticated ? send(200, draft) : send(401, {});
  if (path === '/articles/42/publish') {
    if (!authenticated) return send(401, {});
    if (!body.factChecked || !body.rightsCleared || !body.sensitiveContentReviewed || !body.sourceReferences?.trim()) return send(400, { message: 'Revisão pendente.' });
    draft = { ...draft, ...body, isDraft: false, publishedAt: new Date().toISOString() };
    return send(200, draft);
  }
  if (path === '/articles/42' && req.method === 'PUT') {
    if (!authenticated) return send(401, {});
    draft = { ...draft, ...body }; return send(200, draft);
  }
  if (path === '/articles/admin') return authenticated ? send(200, { content: [draft, ...published], totalPages: 1 }) : send(401, {});
  if (path === '/articles/stats') return authenticated ? send(200, { totalArticles: 7, publishedArticles: 6, draftArticles: 1, categories: 3, recentViews: 0 }) : send(401, {});
  if (path === '/authors') return send(200, [author]);
  if (path === '/articles/categories') return send(200, ['tech', 'ai', 'games']);
  if (/\/view$/.test(path)) return send(200, {});
  const visible = draft.isDraft ? published : [draft, ...published];
  if (path.startsWith('/articles/slug/')) {
    const article = visible.find(item => item.slug === path.split('/').pop());
    return send(article ? 200 : 404, article || {});
  }
  const summaries = visible.map(item => ({ ...item, content: url.searchParams.get('summary') === 'true' ? '' : item.content }));
  if (path === '/articles/featured') return send(200, summaries.filter(item => item.featured));
  if (path.startsWith('/articles')) return send(200, { content: summaries, totalPages: 1 });
  return send(404, {});
});
server.listen(19090, '127.0.0.1', () => console.log('Fixture local: http://127.0.0.1:19090 (sem acesso à produção)'));
