// Classificações fixas: nunca registrar mensagens/respostas livres do SDK.
export function describeImageAIFailure(error) {
  const status = Number(error?.status || error?.statusCode || error?.code);
  const message = String(error?.message || '');
  if (/API_KEY_INVALID|API key not valid/i.test(message)) return 'chave de IA inválida';
  if (/API_KEY_EXPIRED|API key expired/i.test(message)) return 'chave de IA expirada';
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) {
    if (/requestsperday|requests_per_day|perdayperproject|per.day|daily/i.test(message)) return 'cota diária da IA atingida (HTTP 429)';
    return 'limite de uso ou cota da IA atingido (HTTP 429)';
  }
  if (status === 404) return 'modelo indisponível (HTTP 404)';
  if (status === 403) return 'acesso à IA recusado (HTTP 403)';
  if (status >= 500 && status <= 599) return `serviço de IA indisponível (HTTP ${status})`;
  if (status === 400 && /temperature/i.test(message)) return 'parâmetro de temperatura recusado pela IA (HTTP 400)';
  if (status === 400 && /response.?mime.?type|application\/json/i.test(message)) return 'formato JSON recusado pelo modelo (HTTP 400)';
  if (status === 400 && /thinking/i.test(message)) return 'configuração de processamento recusada pelo modelo (HTTP 400)';
  if (status === 400 && /billing|payment|paid tier/i.test(message)) return 'modelo exige configuração de cobrança (HTTP 400)';
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError' || /timeout|timed out/i.test(message)) return 'tempo limite da IA excedido';
  if (error instanceof SyntaxError) return 'resposta JSON inválida';
  return Number.isInteger(status) && status >= 400 && status <= 499
    ? `requisição à IA recusada (HTTP ${status})` : 'resposta inválida ou falha de conexão';
}
