import { plainText } from './editorial.js';
import { placeIsAnchored } from './image-names.js';

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
export function buildImageContext(article = {}, plan) {
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
    articleText: plainText(`${article.subtitle || ''} ${article.content || ''}`).slice(0, 5500),
    focus: plan?.focus || null,
    allowedPlaces: (plan?.alternatives || []).filter(item => item?.kind === 'place'
      && placeIsAnchored(item.subject, central)).map(item => item.subject)
  };
}
function identifies(image, names) {
  const title = ` ${normalizeContext(image.title)} `;
  const categories = (image.categories || []).filter(category => !/\b(competitors?|rivals?|compared|comparison|founded by|owned by|associated with|concorrentes?|rivais|fundadas? por|relacionad[ao]s?)\b/i.test(category))
    .map(category => ` ${normalizeContext(category)} `);
  return names.filter(name => typeof name === 'string' && normalizeContext(name)).some(name => {
    const phrase = ` ${normalizeContext(name)} `;
    return title.includes(phrase) || categories.some(category => category.includes(phrase));
  });
}
function matchesIdentity(image, context) {
  if (!context.focus) return true;
  const aliases = context.focus.kind === 'concept' ? context.focus.aliases : context.focus.verifiedAliases;
  const names = [...new Set([context.focus.name, ...(aliases || [])])];
  if (identifies(image, names)) return true;
  const title = normalizeContext(image.title);
  const sourceLabels = normalizeContext(`${image.title} ${(image.categories || []).join(' ')}`);
  const neutralPlace = !/\b(team|selecao|women|womens|men|mens|players|jogadores|rocket|foguete|president|ceo|people|persons?|portraits?|astronauts?|businesspeople|pessoas|retratos|equipes)\b/.test(sourceLabels);
  return neutralPlace && (context.allowedPlaces || []).some(name => {
    const normalized = normalizeContext(name);
    const isStadium = /\b(stadium|estadio)\b/.test(normalized);
    if (isStadium && !/\b(stadium|estadio)\b/.test(normalizeContext(`${image.title} ${(image.categories || []).join(' ')}`))) return false;
    const properName = normalized.replace(/\b(stadium|estadio|city|cidade)\b/g, '').replace(/\s+/g, ' ').trim();
    const viewWords = new Set(['aerial', 'view', 'views', 'exterior', 'interior', 'panorama', 'panoramic', 'vista', 'vistas', 'aerea', 'aereo',
      'stadium', 'estadio', 'arena', 'city', 'cidade', 'skyline', 'launch', 'site', 'launchpad', 'area', 'grounds', 'construction', 'construcao',
      'building', 'buildings', 'edificio', 'park', 'parque', 'airport', 'aeroporto', 'terminal', 'facility', 'port', 'porto', 'jpg', 'jpeg', 'png', 'webp',
      'the', 'of', 'in', 'at', 'from', 'do', 'da', 'de', 'em', 'diurno', 'noturno', 'night', 'day', 'overview']);
    // Uma foto de alguém "em" um lugar não é uma vista neutra desse lugar.
    // Commons acrescenta nomes locais/datas após vírgulas, parênteses e separadores.
    // Esses detalhes continuam sujeitos à análise dos pixels e dos metadados completos.
    const primaryTitle = normalizeContext(String(image.title || '').split(/\s+-\s+|[,(]/)[0]);
    return [normalized, properName].filter(Boolean).some(place => {
      const index = primaryTitle.indexOf(place);
      if (index < 0 || !identifies(image, [place])) return false;
      const surrounding = `${primaryTitle.slice(0, index)} ${primaryTitle.slice(index + place.length)}`.split(' ').filter(Boolean);
      return surrounding.every(word => viewWords.has(word) || /^\d+$/.test(word));
    });
  });
}
export function matchesImageContext(image, context) {
  if (context && !matchesIdentity(image, context)) return false;
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
