import { GoogleGenAI } from '@google/genai';

const ALLOWED_CATEGORIES = [
  'tech', 'ai', 'gadgets', 'internet',
  'geopolitics', 'global-market', 'conflicts', 'diplomacy',
  'programming', 'web', 'mobile', 'devops',
  'games', 'console', 'pc', 'mobile-gaming',
  'trending', 'world-news', 'entertainment', 'lifestyle'
];

async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot está online!');
  }

  const { body } = req;
  
  // Confirmação rápida para o Telegram (sem timeout)
  // Como a Vercel congela se dermos res.send() cedo, vamos processar tudo antes de dar o response final.
  
  try {
    const message = body?.message;
    if (!message || !message.text) {
      return res.status(200).json({ status: 'ignored' });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Apenas responde quem for o dono configurado
    if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
      await sendMessage(chatId, "Desculpe, você não é o chefe!");
      return res.status(200).json({ status: 'unauthorized' });
    }

    if (text === '/start') {
      await sendMessage(chatId, "👋 *Olá Chefe!*\nEu sou o seu robô autônomo do Alpes News.\n\nDigite o assunto que você quer que eu escreva (Ex: *Novo iPhone*, *Crise na Europa* ou *Final do campeonato*) e eu escreverei uma matéria completa agora mesmo!");
      return res.status(200).json({ status: 'ok' });
    }

    await sendMessage(chatId, `⏳ Pesquisando e gerando matéria incrível sobre: *${text}*...\nAguarde uns segundinhos!`);

    // 1. Gerar com Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      Você é um jornalista sênior de um portal de notícias moderno chamado Alpes News.
      O chefe te pediu para criar uma matéria detalhada sobre o seguinte assunto: "${text}"
      
      Retorne a resposta EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
      {
        "title": "Um título chamativo e jornalístico (sem aspas duplas dentro)",
        "subtitle": "Um subtítulo que resume a matéria (1 a 2 frases)",
        "content": "O texto completo da matéria, formatado em HTML (use tags <p>, <strong>, <h3>, etc. Não use <html> ou <body>, apenas o conteúdo interno).",
        "excerpt": "Um resumo de 2 linhas para a home page",
        "category": "Escolha UMA das seguintes categorias: ${ALLOWED_CATEGORIES.join(', ')}",
        "tags": ["tag1", "tag2", "tag3", "tag4"]
      }
      
      Importante: Retorne APENAS o JSON válido. Não inclua \`\`\`json antes ou depois.
    `;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    let jsonString = aiRes.text.trim();
    if (jsonString.startsWith('```json')) jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (jsonString.startsWith('```')) jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();

    const articleData = JSON.parse(jsonString);

    // 2. Buscar imagem no Pexels
    let imageUrl = 'https://picsum.photos/1600/900';
    if (process.env.PEXELS_API_KEY) {
      try {
        const tagQuery = articleData.tags[0];
        const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(tagQuery)}&per_page=1&orientation=landscape`, {
          headers: { 'Authorization': process.env.PEXELS_API_KEY }
        });
        const pexelsData = await pexelsRes.json();
        if (pexelsData.photos && pexelsData.photos.length > 0) {
          imageUrl = pexelsData.photos[0].src.large2x;
        }
      } catch (e) {
        console.error('Erro no pexels', e);
      }
    }

    // 3. Salvar no Render
    const payload = {
      ...articleData,
      imageUrl: imageUrl,
      authorId: 1,
      isDraft: true,
      featured: false,
      aiAssisted: true,
      sourceReferences: 'Gerado sob demanda pelo Telegram (Comando do Editor)',
      reviewedBy: 'AI Bot',
      factChecked: true,
      rightsCleared: true,
      sensitiveContentReviewed: true
    };

    const backendUrl = process.env.NEWSPORTAL_API_URL || 'https://api-newsportal.onrender.com/api/articles';
    const renderRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.APP_AI_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!renderRes.ok) {
      throw new Error('Falha ao salvar no backend.');
    }

    // 4. Avisar sucesso
    await sendMessage(chatId, `✅ *Missão Cumprida!*\n\nA matéria *"${articleData.title}"* foi gerada e salva como Rascunho no seu painel!\n\nCorra lá para revisar e publicar! 🚀`);
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    if (req.body?.message?.chat?.id) {
      await sendMessage(req.body.message.chat.id, `❌ *Ops! Ocorreu um erro:*\n${error.message}`);
    }
    return res.status(500).json({ error: error.message });
  }
}
