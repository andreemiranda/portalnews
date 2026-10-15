import { NextResponse } from 'next/server';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { getLiveNews } from '@/lib/news-fetcher';
import { slugify } from '@/lib/slug';
import { getSeoCacheHeaders } from '@/lib/seo';

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

export async function GET() {
  const domain = getBaseUrl();
  const now = new Date().toISOString();

  let items: any[] = [];
  try {
    items = await getLiveNews({ category: 'all' });
  } catch (err) {
    console.error('Failed to get news for sitemap-posts:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .slice(0, 150)
  .map((item) => {
    const pubDate = item.isoDate || item.pubDate || now;
    const articleSlug = item.slug || slugify(item.title, item.id);
    const postUrl = `${domain}/noticia/${encodeURIComponent(articleSlug)}`;
    let safeIsoDate: string;
    try {
      safeIsoDate = new Date(pubDate).toISOString();
    } catch {
      safeIsoDate = now;
    }

    return `  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <lastmod>${escapeXml(safeIsoDate)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_CONFIG.name)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(safeIsoDate)}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...getSeoCacheHeaders(1800, 3600),
    },
  });
}
