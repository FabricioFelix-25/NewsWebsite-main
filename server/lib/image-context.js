import { plainText } from './editorial.js';

export function normalizeContext(value) {
  return plainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function teamGender(text) {
  const women = /\b(women|womens|female|feminina|feminino)\b/.test(text);
  const men = /\b(men|mens|male|masculina|masculino)\b/.test(text);
  if (women && men) return 'ambiguous';
  if (women) return 'women';
  if (men) return 'men';
  return null;
}
function teamCategory(text) {
  const age = text.match(/\b(?:sub|under|u)\s*(\d{1,2})\b/);
  return age ? `u${age[1]}` : 'senior';
}
function teamSport(text) {
  if (/\b(basketball|basquete|basquetebol)\b/.test(text)) return 'basketball';
  if (/\b(volleyball|volei|voleibol)\b/.test(text)) return 'volleyball';
  if (/\b(rugby)\b/.test(text)) return 'rugby';
  if (/\b(futsal)\b/.test(text)) return 'futsal';
  if (/\b(beach soccer|beach football|futebol de praia|futebol praia)\b/.test(text)) return 'beach';
  return 'football';
}
export function buildImageContext(article = {}) {
  const firstParagraph = String(article.content || '').match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || plainText(article.content).slice(0, 500);
  const heading = normalizeContext(`${article.title || ''} ${article.subtitle || ''}`);
  const lead = normalizeContext(firstParagraph);
  const central = `${heading} ${lead}`;
  const team = /\b(selecao|selecoes|national team|football team|futebol|futsal|beach soccer)\b/.test(central);
  return {
    team, gender: teamGender(heading) || teamGender(lead),
    category: teamCategory(heading) !== 'senior' ? teamCategory(heading) : teamCategory(lead),
    sport: teamSport(heading) !== 'football' ? teamSport(heading) : teamSport(lead),
    text: central, title: plainText(article.title).slice(0, 250),
    articleText: plainText(`${article.subtitle || ''} ${article.content || ''}`).slice(0, 5500)
  };
}
export function matchesImageContext(image, context) {
  if (!context?.team) return true;
  const title = normalizeContext(image.title);
  const metadata = normalizeContext(`${image.title || ''} ${image.metadataDescription || image.description || ''} ${(image.categories || []).join(' ')}`);
  const gender = teamGender(metadata);
  if (gender === 'ambiguous') return false;
  if (context.gender && gender && gender !== context.gender) return false;
  // Locais neutros podem ilustrar a matéria, desde que citados no título/lide.
  if (/\b(stadium|estadio|arena)\b/.test(title) && !/\b(team|selecao|women|womens|men|mens|players|jogadores)\b/.test(title)) {
    const words = title.split(' ').filter(word => word.length > 2 && !['file', 'jpg', 'jpeg', 'png', 'stadium', 'estadio', 'arena', 'the'].includes(word) && !/^\d+$/.test(word));
    return words.length > 0 && words.filter(word => context.text.includes(word)).length >= Math.min(2, words.length);
  }
  if (!context.gender || gender !== context.gender) return false;
  const category = teamCategory(metadata);
  if (context.category !== category || context.sport !== teamSport(metadata)) return false;
  return true;
}
