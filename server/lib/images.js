import { plainText, safeHttpsUrl } from './editorial.js';

const COMMONS_HOSTS = ['upload.wikimedia.org'];
const STOP_WORDS = new Set(['a', 'o', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'the', 'of', 'and', 'with', 'photo', 'image', 'foto', 'imagem']);

function normalize(value) {
  return plainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

export function relevanceScore(image, directive) {
  const subject = normalize(directive?.subject || directive?.query || '');
  const terms = [...new Set(subject.split(' ').filter(term => term.length > 1 && !STOP_WORDS.has(term)))];
  if (!terms.length) return 0;
  const haystack = ` ${normalize(`${image.title} ${image.description}`)} `;
  // Todas as palavras da entidade devem estar presentes, evitando confundir pessoas/produtos.
  if (!terms.every(term => haystack.includes(` ${term} `))) return 0;
  return (haystack.includes(` ${subject} `) ? 100 : 70) + Math.min(image.width / 1600, 1);
}

export function selectRelevantImages(candidates, directive, count = 2) {
  const seen = new Set();
  return candidates.filter(image => image && image.width >= 800 && image.height > 0
    && image.width > image.height && image.width / image.height <= 2.5
    && safeHttpsUrl(image.url) && safeHttpsUrl(image.sourceUrl) && image.credit && image.license
    && (!image.isStock || directive?.allowStock === true))
    .map(image => ({ ...image, score: relevanceScore(image, directive) }))
    .filter(image => image.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(image => {
      const key = image.sourceUrl;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, count);
}

export function commonsCandidates(data) {
  return Object.values(data?.query?.pages || {}).flatMap(page => {
    const info = page.imageinfo?.[0];
    if (!info || !['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) return [];
    const meta = info.extmetadata || {};
    const license = plainText(meta.LicenseShortName?.value);
    if (!/^(CC0|CC BY(?:-SA)? [\d.]+|Public domain)$/i.test(license)) return [];
    const url = safeHttpsUrl(info.thumburl || info.url, COMMONS_HOSTS);
    const sourceUrl = safeHttpsUrl(info.descriptionurl, ['commons.wikimedia.org']);
    if (!url || !sourceUrl) return [];
    return [{
      url, sourceUrl,
      title: plainText(page.title?.replace(/^File:/, '')),
      description: plainText(meta.ImageDescription?.value || page.title).slice(0, 300),
      credit: plainText(meta.Artist?.value).slice(0, 240),
      license,
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      isStock: false
    }];
  });
}

export function pexelsCandidates(data) {
  return (data?.photos || []).flatMap(photo => {
    const url = safeHttpsUrl(photo.src?.large2x || photo.src?.large, ['images.pexels.com']);
    const sourceUrl = safeHttpsUrl(photo.url, ['www.pexels.com', 'pexels.com']);
    if (!url || !sourceUrl) return [];
    // large2x mantém a proporção original; limite de largura evita baixar o original enorme.
    const width = Math.min(photo.width, 1880);
    return [{
      url, sourceUrl, title: photo.alt || '', description: plainText(photo.alt).slice(0, 300),
      credit: plainText(photo.photographer).slice(0, 240), license: 'Pexels License',
      width, height: Math.round(width * photo.height / photo.width), isStock: true
    }];
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function collectArticleImages(directive, { pexelsApiKey } = {}) {
  if (!directive || typeof directive.query !== 'string' || !directive.query.trim()) return [];
  const candidates = [];
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrsearch: directive.query.slice(0, 180),
    gsrlimit: '20', prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1600', format: 'json'
  });
  try {
    const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': 'AlpesNews/1.0 (https://alpesnews.vercel.app)' }
    });
    candidates.push(...commonsCandidates(data));
  } catch {
    console.warn('Wikimedia indisponível; a imagem poderá ficar pendente de revisão.');
  }
  // Banco de imagens só para assuntos conceituais explicitamente classificados no prompt.
  if (directive.allowStock === true && pexelsApiKey && selectRelevantImages(candidates, directive).length < 2) {
    try {
      const data = await fetchJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(directive.query)}&per_page=12&orientation=landscape`, {
        headers: { Authorization: pexelsApiKey }
      });
      candidates.push(...pexelsCandidates(data));
    } catch {
      console.warn('Pexels indisponível; a imagem poderá ficar pendente de revisão.');
    }
  }
  // Nunca inventar uma foto documental nem preencher com imagem aleatória.
  return selectRelevantImages(candidates, directive);
}
