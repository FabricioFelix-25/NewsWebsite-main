import { plainText, safeHttpsUrl } from './editorial.js';
import { buildImageContext, matchesImageContext } from './image-context.js';
import { verifyImageCandidates } from './image-verification.js';

const COMMONS_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org'];
const STOP_WORDS = new Set(['a', 'o', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'the', 'of', 'and', 'with', 'photo', 'image', 'foto', 'imagem']);

function normalize(value) {
  return plainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

export function relevanceScore(image, directive) {
  const subject = normalize(directive?.subject || directive?.query || '');
  const terms = [...new Set(subject.split(' ').filter(term => term.length > 1 && !STOP_WORDS.has(term)))];
  if (!terms.length) return 0;
  const haystack = ` ${normalize(`${image.title} ${image.metadataDescription || image.description} ${(image.categories || []).join(' ')}`)} `;
  // Todas as palavras da entidade devem estar presentes, evitando confundir pessoas/produtos.
  if (!terms.every(term => haystack.includes(` ${term} `))) return 0;
  // Números de modelo precisam pertencer à mesma expressão, não a outro aparelho/SO.
  if (terms.some(term => /^\d+$/.test(term)) && !haystack.includes(` ${subject} `)) return 0;
  const title = ` ${normalize(image.title)} `;
  const namedPhoto = title.includes(` ${subject} `) ? 30 : 0;
  const document = /\b(decreto|document|documento|oficio|pagenumber|cartoon)\b/.test(title) ? 80 : 0;
  const ratio = image.width / image.height;
  const coverFit = ratio >= 1.2 && ratio <= 2 ? 18 : ratio > 1 ? 8 : 0;
  return (haystack.includes(` ${subject} `) ? 100 : 70) + namedPhoto - document + coverFit + Math.min(image.width / 1600, 1);
}

export function selectRelevantImages(candidates, directive, count = 2) {
  const seen = new Set();
  return candidates.filter(image => image && image.width >= 400 && image.height >= 300
    && image.width / image.height >= 0.4 && image.width / image.height <= 3
    && safeHttpsUrl(image.url) && safeHttpsUrl(image.sourceUrl) && image.credit && image.license
    && (!image.isStock || directive?.allowStock === true))
    .map(image => ({ ...image, score: relevanceScore(image, directive) }))
    .filter(image => image.score >= 70)
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
      metadataDescription: plainText(meta.ImageDescription?.value || page.title).slice(0, 12000),
      credit: plainText(meta.Artist?.value).slice(0, 240),
      license,
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      isStock: false,
      categories: (page.categories || []).map(category => plainText(category.title).replace(/^Category:/, ''))
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
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function isWorkingImage(url) {
  if (!safeHttpsUrl(url, [...COMMONS_HOSTS, 'images.pexels.com'])) return false;
  try {
    const response = await fetch(url, {
      redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AlpesNews/1.0 (https://alpesnews.vercel.app)' }
    });
    const valid = response.ok && /^image\/(jpeg|png|webp)(?:;|$)/i.test(response.headers.get('content-type') || '');
    const reader = response.body?.getReader();
    if (!reader) return false;
    try {
      if (!valid) return false;
      const { value } = await reader.read();
      return Boolean(value?.length >= 12 && (
        (value[0] === 0xff && value[1] === 0xd8 && value[2] === 0xff)
        || (value[0] === 0x89 && value[1] === 0x50 && value[2] === 0x4e && value[3] === 0x47)
        || (String.fromCharCode(...value.slice(0, 4)) === 'RIFF' && String.fromCharCode(...value.slice(8, 12)) === 'WEBP')
      ));
    } finally { await reader.cancel(); }
  } catch { return false; }
}

export async function collectArticleImages(directive, { pexelsApiKey, count = 2, article, ai } = {}) {
  if (!directive || typeof directive.query !== 'string' || !directive.query.trim()) return [];
  const selected = [];
  const checked = new Set();
  const limit = Math.max(1, Math.min(4, Number(count) || 2));
  const context = article ? buildImageContext(article) : null;
  if (context && !ai) return [];
  const searches = [directive, ...(Array.isArray(directive.alternatives) ? directive.alternatives.slice(0, 2) : [])]
    .filter(item => typeof item?.subject === 'string' && typeof item?.query === 'string' && item.query.trim())
    .map(item => ({ ...item, allowStock: directive.allowStock === true }));
  const groups = await Promise.all(searches.map(async (search, index) => {
    const candidates = [];
    const params = new URLSearchParams({
      action: 'query', generator: 'search', gsrnamespace: '6', gsrsearch: search.query.slice(0, 180),
      gsrlimit: '40', prop: 'imageinfo|categories', cllimit: '50', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280', iiurlheight: '1280', format: 'json'
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
    if (search.allowStock === true && pexelsApiKey) {
      try {
        const data = await fetchJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(search.query)}&per_page=12&orientation=landscape`, {
          headers: { Authorization: pexelsApiKey }
        });
        candidates.push(...pexelsCandidates(data));
      } catch {
        console.warn('Pexels indisponível; a imagem poderá ficar pendente de revisão.');
      }
    }
    return selectRelevantImages(candidates.filter(image => matchesImageContext(image, context)), search, 8).map(image => ({ ...image, score: image.score + (index === 0 ? 40 : 0) }));
  }));
  const ranked = groups.flat().sort((a, b) => b.score - a.score).filter(image => {
    if (checked.has(image.sourceUrl)) return false;
    checked.add(image.sourceUrl);
    return true;
  }).slice(0, 12);
  if (context) {
    const verified = await verifyImageCandidates(ai, ranked.slice(0, 6), context);
    console.log(`Imagens aprovadas por contexto e análise visual: ${Math.min(verified.length, limit)}.`);
    return verified.slice(0, limit);
  }
  for (let offset = 0; offset < ranked.length && selected.length < limit; offset += 3) {
    const batch = ranked.slice(offset, offset + 3);
    const working = await Promise.all(batch.map(image => isWorkingImage(image.url)));
    selected.push(...batch.filter((_, index) => working[index]));
  }
  console.log(`Imagens verificadas: ${Math.min(selected.length, limit)}; candidatos pertinentes: ${ranked.length}.`);
  return selected.slice(0, limit);
}
