import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/site-config';
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
    console.error('Failed to get news for sitemap-images:', err);
  }

  // Filter items with real original images
  const itemsWithImages = items.filter(
    (item) => item.imageUrl && item.imageUrl.startsWith('http')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${itemsWithImages
  .map((item) => {
    let safeIsoDate: string;
    try {
      safeIsoDate = new Date(item.isoDate || item.pubDate || now).toISOString();
    } catch {
      safeIsoDate = now;
    }
    const articleSlug = item.slug || slugify(item.title, item.id);
    const articleUrl = `${domain}/noticia/${encodeURIComponent(articleSlug)}`;

    return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <lastmod>${escapeXml(safeIsoDate)}</lastmod>
    <image:image>
      <image:loc>${escapeXml(item.imageUrl)}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
      <image:caption>${escapeXml(item.imageCaption || item.title)}</image:caption>
    </image:image>
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
