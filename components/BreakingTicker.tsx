'use client';

import React from 'react';
import { NewsItem } from '@/lib/types';
import { Zap, ChevronRight } from 'lucide-react';

interface BreakingTickerProps {
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ news, onSelectNews }) => {
  if (!news || news.length === 0) return null;

  const tickerItems = news.slice(0, 10);

  return (
    <div className="bg-red-700 dark:bg-red-950 text-white border-y border-red-800 dark:border-red-900 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Ticker Badge */}
        <div className="bg-red-900 dark:bg-red-900/90 text-white text-xs font-black uppercase tracking-wider px-3 py-2 flex items-center gap-1.5 shrink-0 z-10 shadow-md">
          <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Última Hora</span>
        </div>

        {/* Marquee Content */}
        <div className="overflow-hidden relative w-full py-2">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs sm:text-sm font-medium">
            {tickerItems.concat(tickerItems).map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => onSelectNews(item)}
                className="inline-flex items-center gap-2 hover:underline text-zinc-100 hover:text-white transition group"
              >
                <span className="text-red-200 font-bold text-[11px] bg-red-800/60 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
                <span className="truncate max-w-md">{item.title}</span>
                <span className="text-red-300 text-xs">({item.timeAgo})</span>
                <ChevronRight className="w-3.5 h-3.5 text-red-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
