import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { ALL_CATEGORIES, resolveCategoryDisplayName, categorySlugify } from '@/lib/sources';
import { getLiveNews } from '@/lib/news-fetcher';
import { NewsCard } from '@/components/NewsCard';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import {
  Layers,
  Landmark,
  TrendingUp,
  Scale,
  HeartPulse,
  GraduationCap,
  Palette,
  Trophy,
  Cpu,
  Newspaper,
  MapPin,
  Globe,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveCategoryName(slug: string): string {
  return resolveCategoryDisplayName(slug);
}

function CategoryHeaderIcon({ categoryName, className }: { categoryName: string; className?: string }) {
  const norm = categoryName.toLowerCase();
  if (norm.includes('politica') || norm.includes('política')) return <Landmark className={className} />;
  if (norm.includes('economia')) return <TrendingUp className={className} />;
  if (norm.includes('justica') || norm.includes('justiça')) return <Scale className={className} />;
  if (norm.includes('saude') || norm.includes('saúde')) return <HeartPulse className={className} />;
  if (norm.includes('educacao') || norm.includes('educação')) return <GraduationCap className={className} />;
  if (norm.includes('cultura')) return <Palette className={className} />;
  if (norm.includes('esporte')) return <Trophy className={className} />;
  if (norm.includes('tecnologia')) return <Cpu className={className} />;
  if (norm.includes('gerais')) return <Newspaper className={className} />;
  if (
    norm.includes('para') ||
    norm.includes('tocantins') ||
    norm.includes('goias') ||
    norm.includes('goiás') ||
    norm.includes('santa catarina') ||
    norm.includes('parana') ||
    norm.includes('paraná')
  ) {
    return <MapPin className={className} />;
  }
  if (norm.includes('mundo')) return <Globe className={className} />;
  return <Layers className={className} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = categorySlugify(slug);
  const categoryName = resolveCategoryName(slug);
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/categoria/${cleanSlug}`;

  return {
    title: `Notícias de ${categoryName} | ${SITE_CONFIG.name}`,
    description: `Acompanhe as últimas notícias, análises e coberturas de ${categoryName} em tempo real no ${SITE_CONFIG.name}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Notícias de ${categoryName} • ${SITE_CONFIG.name}`,
      description: `Cobertura completa e jornalismo independente sobre ${categoryName}.`,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: `${domain}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Notícias de ${categoryName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} • ${SITE_CONFIG.name}`,
      description: `Últimas notícias sobre ${categoryName}.`,
    },
  };
}


export default async function CategoriaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cleanSlug = categorySlugify(slug);
  const categoryName = resolveCategoryName(slug);
  const domain = getBaseUrl();

  const items = await getLiveNews({ category: categoryName });
  const displayItems = items.length > 0 ? items : await getLiveNews({ category: 'all' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Notícias de ${categoryName}`,
    url: `${domain}/categoria/${cleanSlug}`,
    description: `Cobertura de ${categoryName} pelo ${SITE_CONFIG.name}.`,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: displayItems.slice(0, 20).map((it, idx) => ({
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
      <CategoryTabs activeCategory={categoryName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Breadcrumb de Navegação */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/categoria" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Editorias
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{categoryName}</span>
        </nav>

        {/* Cabeçalho da Editoria */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <CategoryHeaderIcon categoryName={categoryName} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                  {categoryName}
                </h1>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold">
                  {displayItems.length} {displayItems.length === 1 ? 'matéria' : 'matérias'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Acompanhe as atualizações contínuas sobre {categoryName} no Portal News.
              </p>
            </div>
          </div>

          <div>
            <Link
              href="/categoria"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todas as editorias</span>
            </Link>
          </div>
        </div>

        {/* Listagem de Notícias da Editoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
