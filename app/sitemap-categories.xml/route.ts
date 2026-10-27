import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/site-config';
import { ALL_CATEGORIES, categorySlugify } from '@/lib/sources';
import { getSeoCacheHeaders } from '@/lib/seo';
import { isHumanBrowserRequest, renderModernSitemapHtml, SitemapEntry } from '@/lib/sitemap-viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const domain = getBaseUrl(req);
  const now = new Date().toISOString();

  const entries: SitemapEntry[] = ALL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
    const catSlug = cat.slug || categorySlugify(cat.id);
    return {
      loc: `${domain}/categoria/${catSlug}`,
      lastmod: now,
      changefreq: 'hourly',
      priority: '0.8',
      title: `${cat.name} (${cat.count || 10} matérias)`,
      category: cat.group || 'tema',
    };
  });

  // Visualizador moderno HTML se acessado por humano no navegador
  if (isHumanBrowserRequest(req)) {
    const html = renderModernSitemapHtml({
      title: 'Mapa de Editorias & Assuntos',
      subtitle: 'Estrutura temática e cobertura regional do Portal News',
      currentPath: '/sitemap-categories.xml',
      domain,
      entries,
      type: 'categories',
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...getSeoCacheHeaders(3600, 7200),
      },
    });
  }

  // XML puro para indexadores (sem XSLT)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...getSeoCacheHeaders(3600, 7200),
    },
  });
}
