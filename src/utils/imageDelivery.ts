// Redimensiona na origem; mudar somente width/height no HTML não reduz a decodificação.
export function imageForDisplay(source: string, width = 1280): string {
  if (!source) return source;
  const size = Math.max(64, Math.min(1280, Math.round(width)));
  try {
    const url = new URL(source);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return source;
    if (url.hostname === 'res.cloudinary.com') {
      // URLs assinadas e transformações existentes preservam seu contrato original.
      if (url.search || !/^\/[^/]+\/image\/upload\/v\d+\//.test(url.pathname)) return source;
      url.pathname = url.pathname.replace('/image/upload/', `/image/upload/c_limit,w_${size},h_${size},q_auto,f_auto/`);
      return url.href;
    }
    if (url.hostname === 'upload.wikimedia.org') {
      const match = url.pathname.match(/^\/wikipedia\/(commons|[a-z-]+)\/(?:thumb\/)?([a-f0-9])\/([a-f0-9]{2})\/([^/]+)(?:\/[^/]+)?$/i);
      if (!match || url.search || !/\.(?:jpe?g|png|webp)$/i.test(match[4])) return source;
      const [, project, first, hash, file] = match;
      const thumbWidth = size <= 960 ? 960 : 1280;
      url.pathname = `/wikipedia/${project}/thumb/${first}/${hash}/${file}/${thumbWidth}px-${file}`;
      return url.href;
    }
    if (url.hostname === 'images.pexels.com' && url.pathname.startsWith('/photos/')) {
      url.searchParams.set('auto', 'compress');
      url.searchParams.set('w', String(size));
      url.searchParams.set('dpr', '1');
      url.searchParams.delete('h');
      return url.href;
    }
  } catch { /* URLs locais, blobs e data URLs continuam disponíveis ao editor. */ }
  return source;
}
