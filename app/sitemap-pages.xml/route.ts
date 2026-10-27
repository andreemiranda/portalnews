import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/site-config';
import { getSeoCacheHeaders } from '@/lib/seo';
import { isHumanBrowserRequest, renderModernSitemapHtml, SitemapEntry } from '@/lib/sitemap-viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const domain = getBaseUrl(req);
  const now = new Date().toISOString();

  const pages = [
    { path: '', changefreq: 'always', priority: '1.0', title: 'Página Inicial' },
    { path: '/noticia', changefreq: 'always', priority: '0.9', title: 'Sala de Imprensa & Últimas Notícias' },
    { path: '/categoria', changefreq: 'hourly', priority: '0.9', title: 'Guia Editorial & Editorias' },
    { path: '/videos', changefreq: 'daily', priority: '0.8', title: 'TV Goiânia & Vídeos' },
    { path: '/pagina', changefreq: 'weekly', priority: '0.8', title: 'Índice de Páginas Institucionais' },
    { path: '/pagina/cadastro-certo', changefreq: 'monthly', priority: '0.8', title: 'Cadastro Certo e Alertas' },
    { path: '/pagina/sobre-a-prefeitura', changefreq: 'monthly', priority: '0.8', title: 'Sobre a Prefeitura e Administração' },
    { path: '/pagina/transparencia', changefreq: 'monthly', priority: '0.8', title: 'Transparência e Governança' },
    { path: '/pagina/ouvidoria', changefreq: 'monthly', priority: '0.8', title: 'Ouvidoria Geral e Atendimento' },
    { path: '/pagina/iptu', changefreq: 'monthly', priority: '0.8', title: 'IPTU e Serviços Fazendários' },
    { path: '/pagina/linha-editorial', changefreq: 'monthly', priority: '0.7', title: 'Linha Editorial e Princípios Éticos' },
    { path: '/contato', changefreq: 'monthly', priority: '0.8', title: 'Contato da Redação e Atendimento' },
    { path: '/privacidade', changefreq: 'monthly', priority: '0.7', title: 'Política de Privacidade (LGPD)' },
    { path: '/termos', changefreq: 'monthly', priority: '0.7', title: 'Termos e Condições de Uso' },
    { path: '/cookies', changefreq: 'monthly', priority: '0.7', title: 'Política e Gestão de Cookies' },
  ];

  const entries: SitemapEntry[] = pages.map((p) => ({
    loc: `${domain}${p.path}`,
    lastmod: now,
    changefreq: p.changefreq,
    priority: p.priority,
    title: p.title,
  }));

  // Visualizador moderno HTML se acessado por humano no navegador
  if (isHumanBrowserRequest(req)) {
    const html = renderModernSitemapHtml({
      title: 'Mapa de Páginas Institucionais',
      subtitle: 'Estrutura institucional, transparência e serviços oficiais do portal',
      currentPath: '/sitemap-pages.xml',
      domain,
      entries,
      type: 'pages',
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...getSeoCacheHeaders(3600, 7200),
      },
    });
  }

  // XML puro para robôs de busca (sem XSLT)
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
