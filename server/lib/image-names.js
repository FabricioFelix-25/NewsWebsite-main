import { plainText } from './editorial.js';

const PLACE_TYPES = { estadio: 'stadium', aeroporto: 'airport', cidade: 'city', porto: 'port', parque: 'park', edificio: 'building' };
function placeText(value) {
  return plainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').map(word => PLACE_TYPES[word] || word).join(' ');
}

export function placeIsAnchored(name, centralText) {
  const place = placeText(name);
  const text = ` ${placeText(centralText)} `;
  if (!place) return false;
  if (text.includes(` ${place} `)) return true;
  // Traduz apenas o tipo físico e sua posição. O nome próprio fica idêntico.
  const types = new Set(Object.values(PLACE_TYPES));
  const words = place.split(' ');
  if (types.has(words[0]) && words.length > 1) {
    return text.includes(` ${words.slice(1).join(' ')} ${words[0]} `);
  }
  if (types.has(words.at(-1)) && words.length > 1) {
    return text.includes(` ${words.at(-1)} ${words.slice(0, -1).join(' ')} `);
  }
  return false;
}
