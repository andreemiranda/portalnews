import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/site-config';
import { getSeoCacheHeaders } from '@/lib/seo';
import { isHumanBrowserRequest, renderModernSitemapHtml } from '@/lib/sitemap-viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const domain = getBaseUrl(req);
  const now = new Date().toISOString();

  const subSitemaps = [
    { loc: `${domain}/sitemap-posts.xml`, lastmod: now, changefreq: 'hourly', priority: '1.0', title: 'Notícias & Matérias Jornalísticas' },
    { loc: `${domain}/sitemap-categories.xml`, lastmod: now, changefreq: 'hourly', priority: '0.9', title: 'Arquivo de Editorias e Assuntos' },
    { loc: `${domain}/sitemap-pages.xml`, lastmod: now, changefreq: 'weekly', priority: '0.8', title: 'Páginas Institucionais e Transparência' },
    { loc: `${domain}/sitemap-images.xml`, lastmod: now, changefreq: 'hourly', priority: '0.8', title: 'Galeria e Imagens Originais' },
  ];

  // Visualizador moderno HTML se acessado diretamente por humano no navegador
  if (isHumanBrowserRequest(req)) {
    const html = renderModernSitemapHtml({
      title: 'Índice Geral do Mapa do Site',
      subtitle: 'Estrutura completa de sitemaps indexados do Portal News',
      currentPath: '/sitemap.xml',
      domain,
      entries: subSitemaps,
      type: 'index',
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...getSeoCacheHeaders(3600, 7200),
      },
    });
  }

  // XML puro para robôs de busca (Googlebot, Bingbot) sem diretivas legadas XSLT
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${subSitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...getSeoCacheHeaders(3600, 7200),
    },
  });
}
