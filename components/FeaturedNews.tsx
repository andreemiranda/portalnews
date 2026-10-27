'use client';

import React from 'react';
import Link from 'next/link';
import { NewsItem } from '@/lib/types';
import { Clock, Bookmark, ExternalLink, Volume2, ArrowRight, TrendingUp, Landmark } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { slugify, categorySlugify } from '@/lib/slug';

interface FeaturedNewsProps {
  item: NewsItem;
  secondaryItems?: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
  onToggleBookmark: (item: NewsItem) => void;
  isBookmarked: boolean;
  onReadAudio: (item: NewsItem) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const FeaturedNews: React.FC<FeaturedNewsProps> = ({
  item,
  secondaryItems = [],
  onSelectNews,
  onToggleBookmark,
  isBookmarked,
  onReadAudio,
  fontSize,
}) => {
  if (!item) return null;

  const fontClasses = {
    normal: 'text-2xl sm:text-3xl lg:text-4xl',
    large: 'text-3xl sm:text-4xl lg:text-5xl',
    xlarge: 'text-4xl sm:text-5xl lg:text-6xl',
  };

  const sideItem = secondaryItems[0];
  const sideItem2 = secondaryItems[1];

  const articleHref = `/noticia/${item.slug || slugify(item.title, item.id)}`;
  const sideHref = sideItem ? `/noticia/${sideItem.slug || slugify(sideItem.title, sideItem.id)}` : '#';
  const sideHref2 = sideItem2 ? `/noticia/${sideItem2.slug || slugify(sideItem2.title, sideItem2.id)}` : '#';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* Main Bento Hero Article - Col Span 8 */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
        <Link href={articleHref} prefetch={true} className="relative block w-full h-[320px] sm:h-[400px] bg-zinc-950 overflow-hidden cursor-pointer">
          <OptimizedImage
            src={item.imageUrl}
            alt={item.title}
            priority={true}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Bento Pill Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <Link
                href={`/categoria/${categorySlugify(item.category)}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md transition"
              >
                {item.category}
              </Link>
              <span className="bg-zinc-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Destaque Principal
              </span>
            </div>

            <button
              id="featured-bookmark-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md ${
                isBookmarked
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-900/70 text-white hover:bg-zinc-900'
              }`}
              title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Notícia'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="absolute bottom-5 left-6 right-6 text-white z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {item.timeAgo}
              </span>
            </div>
          </div>
        </Link>

        {/* Caption bar immediately below image */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800">
          <p className="text-xs text-slate-500 dark:text-zinc-400 italic font-sans leading-tight border-l-2 border-red-600 pl-2">
            Foto: {item.imageCaption || `Registro editorial — ${item.title}`}
          </p>
        </div>

        {/* Text Content Block */}
        <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 bg-white dark:bg-zinc-900">
          <div>
            <Link href={articleHref} prefetch={true} className="block">
              <h2
                className={`font-sans font-black tracking-tight text-slate-900 dark:text-zinc-100 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition leading-tight ${fontClasses[fontSize]}`}
              >
                {item.title}
              </h2>
            </Link>

            <p className="mt-4 text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          </div>

          {/* Action Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                id="featured-read-button"
                href={articleHref}
                prefetch={true}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>Ler Matéria</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                id="featured-audio-button"
                onClick={() => onReadAudio(item)}
                className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5"
                title="Ouvir em Áudio"
              >
                <Volume2 className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Ouvir</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
              Destaque Principal
            </span>
          </div>
        </div>
      </div>

      {/* Side Bento Cards Stack - Col Span 4 */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        {/* Dark Bento Highlight Card */}
        <div className="bg-[#1a1c1e] text-white rounded-3xl p-6 shadow-sm border border-zinc-800 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/50">
              Economia & Mercado
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Destaque
            </span>
          </div>

          <div className="my-4">
            {sideItem ? (
              <Link href={sideHref} prefetch={true} className="cursor-pointer group block">
                <h3 className="text-lg font-bold mb-2 leading-snug text-zinc-100 group-hover:text-emerald-400 transition line-clamp-2">
                  {sideItem.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {sideItem.summary}
                </p>
              </Link>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-2 leading-snug text-zinc-100">
                  Mercado, Finanças e Negócios
                </h3>
                <p className="text-slate-400 text-xs">
                  Acompanhe os destaques econômicos, investimentos e cotações do mercado nacional.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 pt-3 border-t border-zinc-800 flex justify-between items-center">
            <span>Portal News Radar</span>
            <span className="text-emerald-400">Ao Vivo</span>
          </div>
        </div>

        {/* Light Bento Highlight Card */}
        <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
              Brasil & Política
            </span>
            <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="my-4">
            {sideItem2 ? (
              <Link href={sideHref2} prefetch={true} className="cursor-pointer group block">
                <h3 className="text-lg font-bold mb-2 leading-snug text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                  {sideItem2.title}
                </h3>
                <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                  {sideItem2.summary}
                </p>
              </Link>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-2 leading-snug text-slate-900 dark:text-zinc-100">
                  Brasil e Cobertura Política
                </h3>
                <p className="text-slate-500 dark:text-zinc-400 text-xs">
                  Atualizações diretas de Brasília e dos principais centros de decisões com apuração jornalística.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Plantão das Editorias</span>
            <span className="text-blue-600 font-bold">Destaques Especiais</span>
          </div>
        </div>
      </div>
    </div>
  );
};

