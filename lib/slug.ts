/**
 * Utilitário para geração de slugs limpos, amigáveis para SEO e seguros para URLs
 */
export function slugify(text: string, fallbackId?: string): string {
  if (!text) {
    return fallbackId ? `noticia-${fallbackId}` : 'noticia';
  }

  // Se o texto passado for uma URL completa acidental, extrair a parte relevante ou ignorar
  let clean = text;
  if (/^https?:\/\//i.test(clean)) {
    try {
      const url = new URL(clean);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      clean = pathSegments[pathSegments.length - 1] || 'noticia';
      clean = clean.replace(/\.(html?|ghtml|php|aspx?)$/i, '');
    } catch {
      clean = 'noticia';
    }
  }

  // Normaliza diacríticos (á -> a, ç -> c, õ -> o, etc.)
  let slug = clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Remove caracteres especiais e pontuação, mantendo apenas letras, números e espaços
  slug = slug.replace(/[^a-z0-9\s-]/g, ' ');

  // Substitui múltiplos espaços e hífens por um único hífen
  slug = slug.replace(/[\s-]+/g, '-');

  // Remove hífens no início e no final
  slug = slug.replace(/^-+|-+$/g, '');

  // Limita o tamanho em aproximadamente 85 caracteres respeitando o fim de palavras
  if (slug.length > 85) {
    const cut = slug.slice(0, 85);
    const lastHyphen = cut.lastIndexOf('-');
    slug = lastHyphen > 30 ? cut.slice(0, lastHyphen) : cut;
  }

  // Fallback caso a limpeza resulte em string vazia
  if (!slug || slug.length < 3) {
    return fallbackId ? `noticia-${String(fallbackId).replace(/[^a-z0-9]/gi, '').slice(0, 20)}` : 'noticia-destaque';
  }

  return slug;
}
