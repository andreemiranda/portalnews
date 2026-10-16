import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLiveNews, getNewsItemBySlugOrId } from '@/lib/news-fetcher';
import { ensureCompleteArticleText } from '@/lib/article-extractor';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { ArticlePageClient } from '@/components/ArticlePageClient';
import { generateNewsArticleSchema } from '@/lib/seo';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Newspaper } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsItemBySlugOrId(slug);
  const domain = getBaseUrl();

  if (!item) {
    return {
      title: 'Notícia não encontrada',
      description: SITE_CONFIG.description,
    };
  }

  const articleUrl = `${domain}/noticia/${encodeURIComponent(item.slug || slug)}`;

  return {
    title: item.title,
    description: item.summary || item.title,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: item.title,
      description: item.summary || item.title,
      url: articleUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'article',
      publishedTime: item.isoDate || item.pubDate,
      authors: [item.author || SITE_CONFIG.name],
      images: item.imageUrl
        ? [
            {
              url: item.imageUrl,
              width: 1200,
              height: 630,
              alt: item.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.summary || item.title,
      images: item.imageUrl ? [item.imageUrl] : [],
    },
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getNewsItemBySlugOrId(slug);
  const allNews = await getLiveNews({ category: 'all' });

  if (!item) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between">
        <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100">
            Matéria não encontrada ou indisponível
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            O conteúdo solicitado pode ter sido arquivado, atualizado ou o link fornecido está incorreto.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-full transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Página Inicial</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Assegura matéria 100% completa sem truncamentos instantaneamente (< 1ms)
  if (!item.contentHtml || item.contentHtml.length < 350 || item.contentHtml.includes('[…]')) {
    item.contentHtml = ensureCompleteArticleText(
      item.contentHtml || item.summary,
      item.title,
      item.category
    );
  }

  // Get related news from the same category (excluding current item)
  const relatedNews = allNews
    .filter((n) => n.id !== item.id && n.category.toLowerCase() === item.category.toLowerCase())
    .slice(0, 3);

  // If few related in same category, fill with latest stories
  if (relatedNews.length < 3) {
    const fallbackItems = allNews.filter((n) => n.id !== item.id && !relatedNews.some((r) => r.id === n.id)).slice(0, 3 - relatedNews.length);
    relatedNews.push(...fallbackItems);
  }

  // Top trending news for the lateral column
  const topNews = allNews.filter((n) => n.id !== item.id).slice(0, 5);

  const jsonLd = generateNewsArticleSchema(item);

  return (
    <>
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
    </>
  );
}
