import { NextResponse } from 'next/server';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { getLiveNews } from '@/lib/news-fetcher';
import { slugify } from '@/lib/slug';
import { getSeoCacheHeaders } from '@/lib/seo';
import { isHumanBrowserRequest, renderModernSitemapHtml, SitemapEntry } from '@/lib/sitemap-viewer';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });
}

export async function GET(req: Request) {
  const domain = getBaseUrl(req);
  const now = new Date().toISOString();

  let items: any[] = [];
  try {
    items = await getLiveNews({ category: 'all' });
  } catch (err) {
    console.error('Failed to get news for sitemap-posts:', err);
  }

  const entries: SitemapEntry[] = items.slice(0, 150).map((item) => {
    const pubDate = item.isoDate || item.pubDate || now;
    const articleSlug = item.slug || slugify(item.title, item.id);
    const postUrl = `${domain}/noticia/${encodeURIComponent(articleSlug)}`;
    let safeIsoDate: string;
    try {
      safeIsoDate = new Date(pubDate).toISOString();
    } catch {
      safeIsoDate = now;
    }

    return {
      loc: postUrl,
      lastmod: safeIsoDate,
      changefreq: 'hourly',
      priority: '0.9',
      title: item.title,
      category: item.category,
      image: item.imageUrl,
    };
  });

  // Visualizador moderno HTML se acessado por humano no navegador
  if (isHumanBrowserRequest(req)) {
    const html = renderModernSitemapHtml({
      title: 'Mapa de Notícias & Matérias',
      subtitle: 'Publicações jornalísticas e reportagens recentes indexadas',
      currentPath: '/sitemap-posts.xml',
      domain,
      entries,
      type: 'posts',
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...getSeoCacheHeaders(1800, 3600),
      },
    });
  }

  // XML puro para robôs de busca (Googlebot, Bingbot) sem XSLT
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${escapeXml(e.lastmod || now)}</lastmod>
    <changefreq>${e.changefreq || 'hourly'}</changefreq>
    <priority>${e.priority || '0.9'}</priority>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_CONFIG.name)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(e.lastmod || now)}</news:publication_date>
      <news:title>${escapeXml(e.title || '')}</news:title>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...getSeoCacheHeaders(1800, 3600),
    },
  });
}
