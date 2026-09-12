# Implantação do AlpesNews e do webhook

O frontend usa `VITE_API_BASE_URL` apontando para `https://api-newsportal.onrender.com/api`. O backend precisa estar implantado com os contratos de revisão privada antes deste frontend.

## Autenticação do Telegram

As chaves existentes `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GEMINI_API_KEY` e `APP_AI_API_KEY` continuam necessárias na Vercel. O mesmo token de bot deve estar guardado nos secrets do repositório `newsportal-ai-bot`.

`TELEGRAM_WEBHOOK_SECRET` é opcional: se não existir, o servidor deriva uma chave HMAC-SHA256 do token do bot usando o contexto exclusivo `alpesnews:telegram-webhook:v1`. Somente a chave derivada é enviada no header de autenticação; o token original não é aceito como header e não é exposto ao navegador. Se houver um segredo explícito, seu valor deve corresponder ao secret homônimo no GitHub.

## Aplicação da configuração

1. No repositório do bot, executar o workflow manual **Configurar e verificar webhook do Telegram**, modo `configure`.
2. Enviar o frontend para a branch `main` conectada à Vercel e aguardar o deploy de produção.
3. Executar o mesmo workflow em modo `verify`. Ele exige 401 para POST anônimo e 200 para POST autenticado, com corpos vazios que não geram matéria nem mensagens.

O procedimento registra somente `https://alpesnews.vercel.app/api/telegram`. Se o bot estiver vinculado a outro endereço, ele para antes de alterar a configuração. Filtros, limite de conexões e mensagens pendentes são preservados.

Depois de trocar o token do bot ou o segredo explícito, é necessário executar `configure` novamente. O workflow de configuração não altera o agendamento de notícias.
