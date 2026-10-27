import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { getLiveNews } from '@/lib/news-fetcher';
import { NewsCard } from '@/components/NewsCard';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import { Newspaper, ChevronRight, Search } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/noticia`;

  return {
    title: `Últimas Notícias e Sala de Imprensa | ${SITE_CONFIG.name}`,
    description:
      'Acompanhe todas as matérias, reportagens investigativas, análises e últimas notícias do Brasil e do mundo no Portal News.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Últimas Notícias | ${SITE_CONFIG.name}`,
      description: SITE_CONFIG.description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
    },
  };
}

export default async function NoticiaIndexPage() {
  const domain = getBaseUrl();
  const items = await getLiveNews({ category: 'all' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Últimas Notícias e Sala de Imprensa',
    url: `${domain}/noticia`,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 30).map((it, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${domain}/noticia/${encodeURIComponent(it.slug || it.id)}`,
        name: it.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <CategoryTabs activeCategory="all" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Notícias</span>
        </nav>

        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Sala de Imprensa</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
              Últimas Notícias
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              {items.length} publicações disponíveis em tempo real com apuração jornalística contínua.
            </p>
          </div>

          <form action="/" method="GET" className="relative w-full sm:w-72">
            <input
              type="text"
              name="q"
              placeholder="Pesquisar notícias..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <p className="text-base text-slate-600 dark:text-zinc-400">
              Carregando as publicações mais recentes...
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
