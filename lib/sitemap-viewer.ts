/**
 * Visualizador Moderno e Responsivo de Sitemaps (Substituição Avançada do XSLT)
 * Elimina completamente a dependência de XSLT (descontinuado no Google Chrome/Chromium)
 * Fornece interface interativa para humanos e entrega XML puro para robôs de busca.
 */

import { SITE_CONFIG } from '@/lib/site-config';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  title?: string;
  category?: string;
  image?: string;
}

export interface ModernSitemapOptions {
  title: string;
  subtitle: string;
  currentPath: string;
  domain: string;
  entries: SitemapEntry[];
  type: 'index' | 'posts' | 'categories' | 'pages' | 'images';
  totalCount?: number;
}

export function isHumanBrowserRequest(req: Request): boolean {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('format') === 'xml' || url.searchParams.get('raw') === 'true') {
      return false;
    }
    if (url.searchParams.get('format') === 'html') {
      return true;
    }
    const accept = req.headers.get('accept') || '';
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();

    // Robôs e indexadores sempre recebem XML puro
    const isBot = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|semrush|ahrefs/i.test(userAgent);
    if (isBot) return false;

    // Navegadores humanos emitem text/html no cabeçalho Accept ao abrir a URL na barra de endereços
    return accept.includes('text/html');
  } catch {
    return false;
  }
}

export function renderModernSitemapHtml(opts: ModernSitemapOptions): string {
  const { title, subtitle, currentPath, domain, entries, type } = opts;
  const count = opts.totalCount ?? entries.length;
  const rawXmlUrl = `${currentPath}?format=xml`;

  const tabs = [
    { label: 'Índice Principal', path: '/sitemap.xml', active: currentPath === '/sitemap.xml' },
    { label: 'Notícias & Matérias', path: '/sitemap-posts.xml', active: currentPath === '/sitemap-posts.xml' },
    { label: 'Categorias & Editorias', path: '/sitemap-categories.xml', active: currentPath === '/sitemap-categories.xml' },
    { label: 'Páginas Institucionais', path: '/sitemap-pages.xml', active: currentPath === '/sitemap-pages.xml' },
    { label: 'Imagens & Mídia', path: '/sitemap-images.xml', active: currentPath === '/sitemap-images.xml' },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} • ${SITE_CONFIG.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-6xl mx-auto space-y-6">
    
    <!-- Top Navigation & Branding -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-md">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">${title}</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              Padrão Moderno (Sem XSLT)
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">${subtitle}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <a href="${rawXmlUrl}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition" title="Visualizar documento em formato XML puro">
          <span>Ver XML Puro</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
        <a href="/" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm">
          <span>Ir para o Portal</span>
          &rarr;
        </a>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex flex-wrap items-center gap-2 bg-slate-200/70 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
      ${tabs.map(tab => `
        <a href="${tab.path}" class="px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${tab.active ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'}">
          ${tab.label}
        </a>
      `).join('')}
    </div>

    <!-- Stats & Live Search Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de URLs</p>
        <p class="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">${count}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Domínio Base</p>
        <p class="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate mt-2">${domain}</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compatibilidade</p>
        <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">100% Googlebot & W3C</p>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Motor XML</p>
        <p class="text-xs font-bold text-sky-600 dark:text-sky-400 mt-2">Nativo Next.js App Router</p>
      </div>
    </div>

    <!-- Search filter script -->
    <div class="relative">
      <input
        type="text"
        id="sitemap-search"
        placeholder="Filtrar links por título, caminho ou assunto..."
        class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm text-slate-800 dark:text-zinc-100"
        oninput="filterLinks()"
      />
    </div>

    <!-- Table of URLs -->
    <div class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-100/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            <tr>
              <th class="py-3 px-4">#</th>
              <th class="py-3 px-4">Localização (URL)</th>
              ${type === 'posts' || type === 'images' ? '<th class="py-3 px-4">Título / Mídia</th>' : ''}
              <th class="py-3 px-4">Última Modificação</th>
              <th class="py-3 px-4 text-center">Frequência</th>
              <th class="py-3 px-4 text-right">Prioridade</th>
            </tr>
          </thead>
          <tbody id="sitemap-tbody" class="divide-y divide-slate-100 dark:divide-zinc-800/80">
            ${entries.map((e, idx) => `
              <tr class="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition sitemap-row" data-text="${(e.loc + ' ' + (e.title || '')).toLowerCase()}">
                <td class="py-3 px-4 font-mono text-xs text-slate-400">${idx + 1}</td>
                <td class="py-3 px-4">
                  <a href="${e.loc}" target="_blank" class="text-red-600 dark:text-red-400 hover:underline font-medium break-all flex items-center gap-1.5">
                    <span>${e.loc}</span>
                    <svg class="w-3 h-3 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </td>
                ${type === 'posts' || type === 'images' ? `
                  <td class="py-3 px-4 text-slate-700 dark:text-zinc-300">
                    ${e.image ? `<img src="${e.image}" alt="" class="w-10 h-10 object-cover rounded-lg inline-block mr-2" />` : ''}
                    <span class="line-clamp-1">${e.title || '-'}</span>
                  </td>
                ` : ''}
                <td class="py-3 px-4 text-slate-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                  ${e.lastmod ? e.lastmod.replace('T', ' ').slice(0, 19) : '-'}
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold">
                    ${e.changefreq || 'daily'}
                  </span>
                </td>
                <td class="py-3 px-4 text-right font-mono font-bold text-xs text-slate-600 dark:text-zinc-300">
                  ${e.priority || '0.8'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="no-results" class="hidden p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
        Nenhum link encontrado com o termo pesquisado.
      </div>
    </div>

    <!-- Modern Notice (No XSLT) -->
    <div class="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Este portal utiliza renderização HTML/XML moderna por negociação de conteúdo, eliminando tecnologia XSLT legada.</span>
      </div>
      <span class="text-[11px] text-slate-400">${SITE_CONFIG.name} • Sincronização Contínua</span>
    </div>

  </div>

  <script>
    function filterLinks() {
      const q = document.getElementById('sitemap-search').value.toLowerCase().trim();
      const rows = document.querySelectorAll('.sitemap-row');
      let visible = 0;
      rows.forEach(row => {
        const text = row.getAttribute('data-text') || '';
        if (!q || text.includes(q)) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });
      const noResults = document.getElementById('no-results');
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    }
  </script>
</body>
</html>`;
}
