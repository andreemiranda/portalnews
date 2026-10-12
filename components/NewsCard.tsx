'use client';

import React from 'react';
import { NewsItem } from '@/lib/types';
import { Clock, Bookmark, Volume2 } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface NewsCardProps {
  item: NewsItem;
  onSelectNews: (item: NewsItem) => void;
  onToggleBookmark: (item: NewsItem) => void;
  isBookmarked: boolean;
  onReadAudio: (item: NewsItem) => void;
  viewMode: 'grid' | 'compact';
  fontSize: 'normal' | 'large' | 'xlarge';
}

const CATEGORY_STYLES: Record<string, string> = {
  pará: 'bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-900',
  brasil: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  economia: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  justiça: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  mundo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
  politica: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  geral: 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
};

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onSelectNews,
  onToggleBookmark,
  isBookmarked,
  onReadAudio,
  viewMode,
  fontSize,
}) => {
  const fontClasses = {
    normal: 'text-base font-bold',
    large: 'text-lg font-bold',
    xlarge: 'text-xl font-black',
  };

  const badgeClass =
    CATEGORY_STYLES[item.categoryId.toLowerCase()] ||
    'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';

  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => onSelectNews(item)}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer flex items-center gap-4 group shadow-sm hover:shadow-md"
      >
        {item.imageUrl && (
          <div className="w-28 h-24 sm:w-36 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-zinc-950 relative">
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title}
              sizes="150px"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}
              >
                {item.category}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-400 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> {item.timeAgo}
              </span>
            </div>

            <h3
              className={`font-serif tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 ${fontClasses[fontSize]}`}
            >
              {item.title}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] text-red-600 dark:text-red-400 font-bold group-hover:underline">Ler matéria →</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReadAudio(item);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                title="Ouvir Notícia"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(item);
                }}
                className={`p-1.5 rounded-full transition ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Notícia'}
              >
                <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectNews(item)}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:border-red-500 dark:hover:border-red-500 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
    >
      <div>
        {/* Bento Card Image (Only if original image exists) */}
        {item.imageUrl ? (
          <div className="relative h-48 sm:h-52 bg-zinc-950 overflow-hidden">
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm ${badgeClass}`}
              >
                {item.category}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md z-10 transition ${
                isBookmarked
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-900/60 text-white hover:bg-zinc-900'
              }`}
              title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Notícia'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${badgeClass}`}
            >
              {item.category}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className={`p-2 rounded-full border transition ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-slate-500 hover:text-amber-500 border-zinc-200 dark:border-zinc-700'
              }`}
              title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Notícia'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}

        {/* Text Body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 mb-2.5 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {item.timeAgo}
            </span>
          </div>

          <h3
            className={`font-serif tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug mb-3 line-clamp-3 ${fontClasses[fontSize]}`}
          >
            {item.title}
          </h3>

          <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {item.summary}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-xs font-bold text-red-600 group-hover:underline">
          Ler matéria completa →
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadAudio(item);
          }}
          className="p-2 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
          title="Ouvir Notícia em Áudio"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
