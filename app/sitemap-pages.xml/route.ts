import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const domain = SITE_CONFIG.domain.replace(/\/+$/, '');
  const now = new Date().toISOString();

  const pages = [
    { path: '', changefreq: 'always', priority: '1.0' },
    { path: '/?category=all', changefreq: 'hourly', priority: '0.9' },
    { path: '/?category=favoritos', changefreq: 'weekly', priority: '0.5' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${domain}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
