import DOMPurify from 'dompurify';

// Drafts contain HTML from external sources too. Never execute it in an editor session.
export function sanitizeArticleHtml(html: string): string {
  const fragment = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: ['p', 'br', 'h2', 'h3', 'h4', 'h5', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'iframe', 'div', 'span', 'hr', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'width', 'height', 'target', 'rel', 'allowfullscreen', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
  });
  fragment.querySelectorAll('[class]').forEach(element => {
    // Preserve editorial formatting without allowing content to cover the review controls.
    const safe = (element.getAttribute('class') || '').split(/\s+/).filter(name =>
      /^(?:(?:sm|md|lg):)?(?:m[trblxy]?-(?:\d+|auto)|p[trblxy]?-\d+|w-(?:full|1\/2|2\/3)|h-auto|max-w-(?:none|full|xs|sm|md|lg|xl|[2-6]xl|\[280px\])|max-h-\[(?:300|420|500)px\]|text-(?:left|center|right|justify|xs|sm|base|lg|xl|[2-5]xl|(?:neutral|gray|blue|red|green)-(?:[1-9]00))|font-(?:normal|medium|semibold|bold)|italic|underline|list-(?:disc|decimal|inside|outside|none)|space-y-\d+|float-(?:left|right|none)|clear-(?:both|left|right)|rounded(?:-(?:md|lg|xl|2xl))?|border(?:-(?:l|r|t|b))?(?:-[1-4])?|border-(?:neutral|gray|blue)-(?:[1-9]00)|bg-(?:neutral|gray)-(?:[1-9]00)|shadow(?:-(?:sm|md|lg))?|aspect-video|overflow-hidden|object-(?:cover|contain))$/.test(name));
    if (safe.length) element.setAttribute('class', safe.join(' '));
    else element.removeAttribute('class');
  });
  fragment.querySelectorAll<HTMLElement>('[style]').forEach(element => {
    const safeStyles = document.createElement('span').style;
    for (const property of ['text-align', 'float', 'width', 'max-width', 'height', 'margin', 'margin-left', 'margin-right', 'color', 'background-color', 'font-weight', 'font-style', 'text-decoration']) {
      const value = element.style.getPropertyValue(property);
      if (value && !/url\s*\(|expression|var\s*\(/i.test(value)) safeStyles.setProperty(property, value);
    }
    element.removeAttribute('style');
    if (safeStyles.cssText) element.setAttribute('style', safeStyles.cssText);
  });
  fragment.querySelectorAll('iframe').forEach(frame => {
    try {
      const url = new URL(frame.getAttribute('src') || '');
      if (url.protocol !== 'https:' || !['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) || !/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) {
        frame.remove();
        return;
      }
      frame.src = `https://www.youtube-nocookie.com${url.pathname}`;
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('referrerpolicy', 'no-referrer');
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
      frame.setAttribute('allowfullscreen', '');
      frame.style.aspectRatio = '16 / 9';
      frame.style.width = '100%';
      frame.style.height = 'auto';
    } catch { frame.remove(); }
  });
  fragment.querySelectorAll('a').forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
  fragment.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (!/^(https?:\/\/|\/[^/]|data:image\/(?:png|jpeg|gif|webp);base64,|blob:)/i.test(src)) {
      img.remove();
      return;
    }
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('referrerpolicy', 'no-referrer');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    if (!img.hasAttribute('width') || !img.hasAttribute('height')) img.style.aspectRatio = '16 / 9';
    img.style.objectFit = 'contain';
  });
  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
}
