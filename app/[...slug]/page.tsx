import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { ALL_CATEGORIES, normalizeCategoryText, resolveCategoryDisplayName, categorySlugify } from '@/lib/sources';
import { getLiveNews, getNewsItemBySlugOrId } from '@/lib/news-fetcher';
import { ensureCompleteArticleText } from '@/lib/article-extractor';
import { ArticlePageClient } from '@/components/ArticlePageClient';
import { NewsCard } from '@/components/NewsCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { generateNewsArticleSchema } from '@/lib/seo';
import CategoriaDetailPage from '@/app/categoria/[slug]/page';
import PaginaDetailPage from '@/app/pagina/[slug]/page';
import { Search, Compass, ChevronRight, Newspaper } from 'lucide-react';

export const revalidate = 60;

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

function normalizeSegment(seg: string): string {
  return normalizeCategoryText(decodeURIComponent(seg));
}

function isCategorySlug(slug: string): boolean {
  const norm = normalizeCategoryText(decodeURIComponent(slug));
  const cleanSlug = categorySlugify(slug);
  return ALL_CATEGORIES.some(
    (c) =>
      c.slug === cleanSlug ||
      c.slug === slug ||
      categorySlugify(c.id) === cleanSlug ||
      normalizeCategoryText(c.id) === norm ||
      normalizeCategoryText(c.name) === norm ||
      normalizeCategoryText(c.id).replace(/\s+/g, '-') === norm.replace(/\s+/g, '-')
  );
}

const KNOWN_PAGES = new Set([
  'sobre',
  'linha-editorial',
  'transparencia',
  'ouvidoria',
  'cadastro-certo',
  'sobre-a-prefeitura',
  'prefeitura',
  'iptu',
  'politica-editorial',
  'expediente',
  'contato',
  'privacidade',
  'termos',
  'cookies',
]);

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lastSegment = slug[slug.length - 1] || '';
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/${slug.join('/')}`;

  // 1. Matéria Jornalística
  const item = await getNewsItemBySlugOrId(lastSegment);
  if (item) {
    return {
      title: item.title,
      description: item.summary || item.title,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: item.title,
        description: item.summary || item.title,
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
        locale: 'pt_BR',
        type: 'article',
        publishedTime: item.isoDate || item.pubDate,
        authors: [item.author || SITE_CONFIG.name],
        images: item.imageUrl
          ? [{ url: item.imageUrl, width: 1200, height: 630, alt: item.title }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: item.title,
        description: item.summary || item.title,
      },
    };
  }

  // 2. Categoria
  if (isCategorySlug(lastSegment)) {
    return {
      title: `Notícias e Cobertura • ${SITE_CONFIG.name}`,
      description: `Todas as notícias e reportagens em tempo real sobre ${lastSegment}.`,
      alternates: { canonical: canonicalUrl },
    };
  }

  // 3. Página Institucional ou Geral
  return {
    title: `${SITE_CONFIG.name} — Jornalismo e Informação`,
    description: SITE_CONFIG.description,
    alternates: { canonical: canonicalUrl },
  };
}

export default async function CatchAllUniversalResolver({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const lastSegment = slug[slug.length - 1] || '';
  const fullPath = slug.join('/');
  const domain = getBaseUrl();

  // 1. Resolução como Categoria / Editoria
  if (isCategorySlug(lastSegment)) {
    return <CategoriaDetailPage params={Promise.resolve({ slug: lastSegment })} />;
  }

  // 2. Resolução como Matéria Jornalística por Slug ou ID
  const item = await getNewsItemBySlugOrId(lastSegment);
  if (item) {
    if (!item.contentHtml || item.contentHtml.length < 350 || item.contentHtml.includes('[…]')) {
      item.contentHtml = ensureCompleteArticleText(
        item.contentHtml || item.summary,
        item.title,
        item.category
      );
    }
    const allNews = await getLiveNews({ category: 'all' });
    const relatedNews = allNews
      .filter((n) => n.id !== item.id && n.category.toLowerCase() === item.category.toLowerCase())
      .slice(0, 3);
    const topNews = allNews.filter((n) => n.id !== item.id).slice(0, 5);
    const jsonLd = generateNewsArticleSchema(item);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ArticlePageClient
          item={item}
          relatedNews={relatedNews}
          topNews={topNews}
          allNews={allNews}
        />
      </div>
    );
  }

  // 3. Resolução como Página Institucional
  if (KNOWN_PAGES.has(lastSegment.toLowerCase())) {
    return <PaginaDetailPage params={Promise.resolve({ slug: lastSegment })} />;
  }

  // 4. Fallback Dinâmico Inteligente (Sem 404)
  // Busca notícias relacionadas ao termo na URL ou carrega os destaques recentes
  const searchKeywords = lastSegment.replace(/[-_]+/g, ' ');
  const relatedNews = await getLiveNews({ searchQuery: searchKeywords });
  const displayItems = relatedNews.length > 0 ? relatedNews : (await getLiveNews({ category: 'all' })).slice(0, 9);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <CategoryTabs activeCategory="" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Localizador de Conteúdo</span>
        </nav>

        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 font-sans">
            Guia de Conteúdo e Notícias
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Localizamos publicações recentes e matérias de interesse público para sua navegação.
          </p>

          <form action="/" method="GET" className="relative max-w-md mx-auto pt-2">
            <input
              type="text"
              name="q"
              defaultValue={searchKeywords}
              placeholder="Pesquisar por tema, autor ou cidade..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600" />
              <span>Matérias Recomendadas</span>
            </h2>
            <Link href="/" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
              Ver página inicial completa &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.slice(0, 9).map((it) => (
              <NewsCard key={it.id} item={it} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
