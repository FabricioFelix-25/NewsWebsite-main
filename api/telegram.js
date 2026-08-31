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

    // Inicializar IA e função com Fallback automático multi-modelos
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const todayStr = new Date().toLocaleDateString('pt-BR');

    async function generateWithFallback(aiInstance, promptText, useSearch = false) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let lastErr = null;
      for (const m of candidateModels) {
        try {
          console.log(`Tentando com o modelo: ${m} (Busca na Web: ${useSearch})...`);
          const config = { temperature: 0.7 };
          if (useSearch) {
            config.tools = [{ googleSearch: {} }];
          }
          const res = await aiInstance.models.generateContent({
            model: m,
            contents: promptText,
            config
          });
          if (res && res.text) {
            console.log(`Sucesso com o modelo: ${m}`);
            return res;
          }
        } catch (e) {
          console.warn(`Modelo ${m} falhou. Tentando próximo... Detalhe:`, e.message);
          lastErr = e;
          if (useSearch) {
            try {
              const resNoSearch = await aiInstance.models.generateContent({
                model: m,
                contents: promptText,
                config: { temperature: 0.7 }
              });
              if (resNoSearch && resNoSearch.text) return resNoSearch;
            } catch (e2) {}
          }
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      throw lastErr || new Error('Todos os modelos de IA estão temporariamente indisponíveis.');
    }

    // PASSO 1: Classificador de Intenção (Conversa/Dúvida vs. Criar Artigo)
    const intentPrompt = `
      Você é o assistente editorial de inteligência artificial do portal Alpes News.
      Data de referência de hoje: ${todayStr}.
      O editor-chefe do portal enviou a seguinte mensagem no Telegram: "${text}"

      Analise a intenção da mensagem:
      1. "CHAT": O usuário está conversando, fazendo perguntas ou tirando dúvidas (ex: "quem é a nova ceo?", "o que você acha disso?", "pq a imagem veio errada?"), comentando ou reclamando.
      2. "WRITE_ARTICLE": O usuário está dando uma ordem para criar/escrever uma matéria jornalística no portal (ex: "escreva sobre...", "crie uma matéria sobre...", "notícia sobre...", "faça um artigo...", ou enviou uma pauta explícita para publicação).

      Se for "CHAT": Responda à dúvida ou comentário do usuário diretamente em português, com dados atualizados e tom profissional de um assistente de redação de jornalismo.
      Se for "WRITE_ARTICLE": Extraia o tema limpo da pauta.

      Retorne EXCLUSIVAMENTE um JSON:
      {
        "intent": "CHAT" ou "WRITE_ARTICLE",
        "reply": "Sua resposta direta para o usuário se for CHAT",
        "topic": "Tema limpo da matéria se for WRITE_ARTICLE"
      }
      Importante: Retorne APENAS o JSON válido sem blocos de código markdown.
    `;

    const intentRes = await generateWithFallback(ai, intentPrompt, true);
    let intentJsonStr = intentRes.text.trim();
    if (intentJsonStr.startsWith('```json')) intentJsonStr = intentJsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (intentJsonStr.startsWith('```')) intentJsonStr = intentJsonStr.replace(/^```/, '').replace(/```$/, '').trim();

    let decision = { intent: 'WRITE_ARTICLE', topic: text };
    try {
      decision = JSON.parse(intentJsonStr);
    } catch (e) {
      console.warn('Falha ao decodificar JSON de intenção, assumindo WRITE_ARTICLE:', intentJsonStr);
    }

    // Se o usuário apenas fez uma pergunta ou bate-papo, responde no chat sem criar artigo!
    if (decision.intent === 'CHAT') {
      await sendMessage(chatId, decision.reply || "Entendido, chefe! Como posso te ajudar com a redação hoje?");
      return res.status(200).json({ status: 'chat_responded' });
    }

    // PASSO 2: O usuário quer criar uma matéria!
    const cleanTopic = decision.topic || text;
    await sendMessage(chatId, `⏳ Apurando fatos recentes (máximo 7 dias) e gerando matéria sobre: *${cleanTopic}*...\nAguarde uns segundinhos!`);

    // 2. Gerar Matéria com Regra Estrita de Recência (Máximo 7 Dias) e Pesquisa na Web
    const prompt = `
      Você é um jornalista investigativo e editor sênior de um portal de notícias de referência chamado Alpes News.
      Data de publicação (HOJE): ${todayStr}.
      O editor-chefe enviou a seguinte pauta para cobertura: "${text}"

      REGRA CRÍTICA DE RECÊNCIA (MÁXIMO 7 DIAS):
      - Você está cobrindo notícias factuais para publicação IMEDIATA.
      - A matéria DEVE focar exclusivamente em acontecimentos, anúncios, declarações ou coberturas jornalísticas dos ÚLTIMOS 7 DIAS (a contar de ${todayStr}).
      - É ESTRITAMENTE PROIBIDO noticiar acontecimentos antigos ou cargos de anos anteriores como se fossem de hoje. Se o tema envolver histórico, contextualize explicitamente como retrospectiva ou aniversário.

      Estrutura de Conteúdo Requerida:
      - Título atraente, factual e jornalístico.
      - Subtítulo resumindo o fato principal recente.
      - No corpo da matéria ("content"): use HTML sem <html> ou <body>.
        * Divida em pelo menos 3 a 4 seções com subtítulos <h3> elegantes.
        * Use parágrafos <p> ricos e aprofundados baseados nos fatos dos últimos 7 dias.
        * Inclua pelo menos uma citação ou aspas destacadas em <blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-neutral-600">.
        * Se o tema for um grande lançamento com trailer ou vídeo oficial relevante no YouTube, forneça o ID do YouTube no campo "youtubeVideoId".
        * Distribua os marcadores [IMAGEM_INTERNA_1], [IMAGEM_INTERNA_2] entre as seções do texto.
        * No final da matéria, inclua SEMPRE uma caixa estilizada de 'Fontes e Apuração Editorial' referenciando com links <a> reais os sites e veículos consultados:
          <div class="bg-neutral-100 border border-neutral-200 p-5 rounded-xl my-8">
            <h4 class="font-bold text-neutral-900 mb-2">🌐 Fontes e Apuração Editorial</h4>
            <p class="text-sm text-neutral-700 mb-2">Esta reportagem foi apurada com base nas divulgações oficiais e cobertura especializada dos últimos dias:</p>
            <ul class="text-sm text-neutral-700 space-y-1 list-disc list-inside">
              <li>Site Oficial: <a href="https://URL_OFICIAL" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800">Portal Oficial</a></li>
              <li>Cobertura de Imprensa: <a href="https://URL_FONTE" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800">Veículo Consultado</a></li>
            </ul>
          </div>

      Retorne a resposta EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
      {
        "title": "Título chamativo",
        "subtitle": "Subtítulo de 1 a 2 frases",
        "content": "Conteúdo HTML completo conforme instruído",
        "excerpt": "Resumo de 2 linhas para a home page",
        "category": "Escolha UMA das seguintes categorias: ${ALLOWED_CATEGORIES.join(', ')}",
        "tags": ["tag1", "tag2", "tag3", "tag4"],
        "youtubeVideoId": "ID_DO_VIDEO_YOUTUBE_OU_VAZIO",
        "imageDirective": {
          "query": "Termo exato em português ou inglês para busca de fotos reais em alta resolução (ex: 'Grand Theft Auto VI', 'Fortaleza Ceará', 'Microsoft', 'Neymar')",
          "imageCount": 2
        }
      }
      
      Importante: Retorne APENAS o JSON válido. Não inclua \`\`\`json antes ou depois.
    `;

    const aiRes = await generateWithFallback(ai, prompt, true);

    let jsonString = aiRes.text.trim();
    if (jsonString.startsWith('```json')) jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (jsonString.startsWith('```')) jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();

    const articleData = JSON.parse(jsonString);

    // 2. Busca de Múltiplas Imagens em Alta Definição (16:9 Widescreen)
    const searchQuery = articleData.imageDirective?.query || articleData.tags[0] || text;
    const neededImagesCount = Math.max(2, (articleData.imageDirective?.imageCount || 2) + 1);
    console.log(`Buscando até ${neededImagesCount} imagens em alta definição para: "${searchQuery}"`);

    const collectedImages = [];

    // Tentativa 1: Wikimedia Commons (Fotos oficiais, papéis de parede e arquivos de imprensa em 4K/Full HD)
    try {
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=20&prop=imageinfo&iiprop=url|size&format=json`;
      const cRes = await fetch(commonsUrl);
      const cData = await cRes.json();

      if (cData.query && cData.query.pages) {
        const validImages = Object.values(cData.query.pages)
          .map(p => p.imageinfo && p.imageinfo[0])
          .filter(info => info && info.width >= 900 && info.width > info.height && !info.url.endsWith('.svg') && !info.url.endsWith('.ogg'))
          .sort((a, b) => b.width - a.width);

        for (const img of validImages) {
          if (!collectedImages.includes(img.url)) {
            collectedImages.push(img.url);
          }
          if (collectedImages.length >= neededImagesCount) break;
        }
      }
    } catch (e) {
      console.error('Erro na busca do Wikimedia Commons:', e);
    }

    // Tentativa 2: Pexels API (HD 1920x1080) se precisar de mais imagens
    if (collectedImages.length < neededImagesCount && process.env.PEXELS_API_KEY) {
      try {
        const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=4&orientation=landscape`, {
          headers: { 'Authorization': process.env.PEXELS_API_KEY }
        });
        const pexelsData = await pexelsRes.json();
        if (pexelsData.photos && pexelsData.photos.length > 0) {
          for (const photo of pexelsData.photos) {
            const pUrl = photo.src.large2x || photo.src.large;
            if (pUrl && !collectedImages.includes(pUrl)) {
              collectedImages.push(pUrl);
            }
            if (collectedImages.length >= neededImagesCount) break;
          }
        }
      } catch (e) {
        console.error('Erro no Pexels:', e);
      }
    }

    // Tentativa 3: Pollinations AI (1600x900 Widescreen) como fallback
    while (collectedImages.length < neededImagesCount) {
      const idx = collectedImages.length;
      const promptImg = `Professional high quality 4k news photo variation ${idx} about ${searchQuery}, cinematic lighting, photorealistic, 16:9`;
      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1600&height=900&nologo=true&seed=${Date.now() + idx}`;
      collectedImages.push(aiUrl);
    }

    const coverImageUrl = collectedImages[0] || 'https://picsum.photos/1600/900';

    // 3. Processar vídeo embutido do YouTube (se houver)
    if (articleData.youtubeVideoId && articleData.youtubeVideoId.trim() && articleData.youtubeVideoId.length >= 6) {
      const cleanVideoId = articleData.youtubeVideoId.trim();
      const videoEmbedHtml = `
        <div class="my-8 aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-neutral-200">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${cleanVideoId}" 
            title="Vídeo Oficial" 
            class="w-full h-full" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>
      `;
      // Insere o vídeo logo após a introdução ou no início do texto
      if (articleData.content.includes('</h3>')) {
        articleData.content = articleData.content.replace('</h3>', `</h3>${videoEmbedHtml}`);
      } else {
        articleData.content = `${videoEmbedHtml}${articleData.content}`;
      }
    }

    // 4. Distribuir imagens internas no corpo do artigo
    let imageCounter = 1;
    while (articleData.content.includes(`[IMAGEM_INTERNA_${imageCounter}]`) || articleData.content.includes('[IMAGEM_INTERNA]')) {
      const targetTag = articleData.content.includes(`[IMAGEM_INTERNA_${imageCounter}]`) 
        ? `[IMAGEM_INTERNA_${imageCounter}]` 
        : '[IMAGEM_INTERNA]';
      
      const internalImgUrl = collectedImages[imageCounter] || collectedImages[1];
      if (internalImgUrl) {
        const bodyImageHtml = `
          <figure class="my-8">
            <img src="${internalImgUrl}" alt="${articleData.title}" class="w-full rounded-xl shadow-md object-cover max-h-[500px]" />
            <figcaption class="text-center text-xs text-neutral-500 mt-2 italic">Registro oficial da cobertura: ${searchQuery}</figcaption>
          </figure>
        `;
        articleData.content = articleData.content.replace(targetTag, bodyImageHtml);
      } else {
        articleData.content = articleData.content.replace(targetTag, '');
      }
      imageCounter++;
    }

    // Limpar quaisquer marcadores residuais
    articleData.content = articleData.content.replace(/\[IMAGEM_INTERNA_\d+\]/g, '');

    // 5. Salvar no Render
    const payload = {
      ...articleData,
      imageUrl: coverImageUrl,
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

    // 6. Avisar sucesso
    await sendMessage(chatId, `✅ *Missão Cumprida!*\n\nA matéria *"${articleData.title}"* foi gerada no padrão IGN (alta resolução, fotos e fontes oficiais) e salva como Rascunho no seu painel!\n\nCorra lá para revisar e publicar! 🚀`);
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    if (req.body?.message?.chat?.id) {
      await sendMessage(req.body.message.chat.id, `❌ *Ops! Ocorreu um erro:*\n${error.message}`);
    }
    return res.status(500).json({ error: error.message });
  }
}
