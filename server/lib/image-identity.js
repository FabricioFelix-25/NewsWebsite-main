const API_URL = 'https://www.wikidata.org/w/api.php';
const CACHE_TTL = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 64;
const identityCache = new Map();

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function validName(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 180
    && !/[\u0000-\u001f<>]/.test(value) && Boolean(normalize(value));
}
function valuesFromEntity(entity) {
  return ['en', 'pt'].flatMap(language => [
    entity.labels?.[language]?.value,
    ...(Array.isArray(entity.aliases?.[language]) ? entity.aliases[language].map(alias => alias?.value) : [])
  ]).filter(validName).map(value => value.trim());
}
function searchItemMatches(item, name) {
  if (!item || !/^Q[1-9]\d*$/.test(item.id || '')) return false;
  const names = [item.label, item.display?.label?.value,
    ...(['label', 'alias'].includes(item.match?.type) ? [item.match.text] : []),
    ...(Array.isArray(item.aliases) ? item.aliases.map(alias => typeof alias === 'string' ? alias : alias?.value) : [])
  ].filter(validName);
  return names.some(value => normalize(value) === name);
}
async function wikiRequest(parameters) {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({ ...parameters, format: 'json' }).toString();
  const response = await fetch(url.href, {
    redirect: 'error', signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'AlpesNews/1.0 (https://alpesnews.vercel.app)' }
  });
  if (!response.ok) throw new Error('Identidade indisponível.');
  const data = await response.json();
  if (!data || data.error) throw new Error('Identidade indisponível.');
  return data;
}
function storeIdentity(key, value) {
  const now = Date.now();
  for (const [cachedKey, entry] of identityCache) if (now - entry.time >= CACHE_TTL) identityCache.delete(cachedKey);
  if (!identityCache.has(key) && identityCache.size >= MAX_CACHE_ENTRIES) identityCache.delete(identityCache.keys().next().value);
  identityCache.set(key, { ...value, time: now });
}

export async function verifyPlanAliases(plan) {
  const focus = { ...(plan?.focus || {}), verifiedAliases: [] };
  delete focus.wikidataId;
  const result = { ...(plan || {}), focus };
  delete result.aliasVerification;
  if (!validName(focus.name)) return result;
  if (focus.kind === 'concept') {
    focus.verifiedAliases = (Array.isArray(focus.aliases) ? focus.aliases : []).filter(validName).slice(0, 2);
    result.aliasVerification = 'concept';
    return result;
  }
  const name = normalize(focus.name);
  const key = `${focus.kind || ''}:${name}`;
  try {
    let identity = identityCache.get(key);
    if (identity && Date.now() - identity.time >= CACHE_TTL) {
      identityCache.delete(key);
      identity = null;
    }
    if (!identity) {
      const search = await wikiRequest({ action: 'wbsearchentities', search: focus.name.trim(), language: 'pt', uselang: 'pt', limit: '5' });
      if (!Array.isArray(search.search)) return result;
      const exactCase = search.search.filter(item => item.label === focus.name.trim() && /^Q[1-9]\d*$/.test(item.id || ''));
      const matches = exactCase.length ? exactCase : search.search.filter(item => searchItemMatches(item, name));
      const ids = [...new Set(matches.map(item => item.id))];
      if (ids.length !== 1) return result;
      const id = ids[0];
      const data = await wikiRequest({ action: 'wbgetentities', ids: id, props: 'labels|aliases', languages: 'en|pt' });
      const entity = data.entities?.[id];
      if (!entity || entity.missing !== undefined || (entity.id && entity.id !== id)) return result;
      const names = valuesFromEntity(entity);
      // O segundo retorno deve confirmar o mesmo nome exato, além da mesma QID.
      if (!names.some(value => normalize(value) === name)) return result;
      const aliases = [...new Map(names.filter(value => normalize(value) !== name).map(value => [normalize(value), value])).values()];
      identity = { id, aliases };
      storeIdentity(key, identity);
    }
    focus.verifiedAliases = [...identity.aliases];
    focus.wikidataId = identity.id;
    result.aliasVerification = 'wikidata';
  } catch {
    // Sem autoridade inequívoca, somente o nome canônico continua disponível.
  }
  return result;
}
