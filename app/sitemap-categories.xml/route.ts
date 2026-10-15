import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/site-config';
import { ALL_CATEGORIES } from '@/lib/sources';
import { getSeoCacheHeaders } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const domain = getBaseUrl();
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ALL_CATEGORIES.map(
  (cat) => `  <url>
    <loc>${domain}/?category=${encodeURIComponent(cat.id)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`
).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...getSeoCacheHeaders(3600, 7200),
    },
  });
}
