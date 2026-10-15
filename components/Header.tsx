'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  RotateCw,
  Clock,
  Compass,
} from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';
import { SITE_CONFIG } from '@/lib/site-config';
import { applyTheme, applyFontSize, FontSizeOption } from '@/lib/accessibility';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  bookmarkCount: number;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenFeedManager?: () => void;
  lastUpdatedTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  bookmarkCount,
  activeCategory,
  setActiveCategory,
  onRefresh,
  isLoading,
  fontSize,
  setFontSize,
  isDarkMode,
  setIsDarkMode,
  lastUpdatedTime,
}) => {
  const [clientDate, setClientDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formatted = now.toLocaleDateString('pt-BR', options);
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    const frameId = requestAnimationFrame(() => {
      setClientDate(capitalized);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleDecreaseFont = () => {
    if (fontSize === 'xlarge') {
      setFontSize('large');
      applyFontSize('large');
    } else {
      setFontSize('normal');
      applyFontSize('normal');
    }
  };

  const handleIncreaseFont = () => {
    if (fontSize === 'normal') {
      setFontSize('large');
      applyFontSize('large');
    } else {
      setFontSize('xlarge');
      applyFontSize('xlarge');
    }
  };

  const handleSetFont = (size: FontSizeOption) => {
    setFontSize(size);
    applyFontSize(size);
  };

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    applyTheme(nextDark);
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-semibold text-red-400">
              <Compass className="w-3.5 h-3.5" />
              Edição Nacional
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="flex items-center gap-1.5 text-zinc-400" suppressHydrationWarning>
              <Clock className="w-3.5 h-3.5" />
              <span suppressHydrationWarning>{clientDate || 'Edição Brasil'}</span>
            </span>
            {lastUpdatedTime && (
              <>
                <span className="hidden md:inline text-zinc-600">|</span>
                <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Atualizado às {lastUpdatedTime}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400 hidden md:inline text-[11px] font-medium">Acessibilidade:</span>
            
            {/* Accessibility Font Size Buttons */}
            <div className="flex items-center bg-zinc-800 rounded p-0.5 border border-zinc-700" role="group" aria-label="Ajustar tamanho da fonte">
              <button
                id="font-size-decrease"
                onClick={handleDecreaseFont}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                title="Diminuir fonte (A-)"
                aria-label="Diminuir fonte"
              >
                A-
              </button>
              <button
                id="font-size-normal"
                onClick={() => handleSetFont('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  fontSize === 'normal'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Tamanho normal padrão (100%)"
                aria-label="Tamanho normal padrão"
              >
                A
              </button>
              <button
                id="font-size-large"
                onClick={() => handleSetFont('large')}
                className={`px-2 py-0.5 rounded text-[12px] font-bold transition cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Aumentar fonte (115%)"
                aria-label="Fonte média"
              >
                A+
              </button>
              <button
                id="font-size-xlarge"
                onClick={() => handleSetFont('xlarge')}
                className={`px-2 py-0.5 rounded text-[13px] font-bold transition cursor-pointer ${
                  fontSize === 'xlarge'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Fonte extra grande (130%)"
                aria-label="Fonte extra grande"
              >
                A++
              </button>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              id="theme-toggle-button"
              onClick={handleToggleTheme}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer text-xs font-bold"
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label={isDarkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[11px]">Modo Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-4 text-center md:text-left cursor-pointer group"
            onClick={() => setActiveCategory('all')}
          >
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0 ring-4 ring-red-100 dark:ring-red-950/50 group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-100 font-sans">
                  PORTAL <span className="text-red-600">NEWS</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium tracking-wide mt-0.5">
                {SITE_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notícias ou editorias..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="refresh-feed-button"
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-2.5 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/30 transition flex items-center justify-center shadow-sm cursor-pointer ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Atualizar Notícias"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
              </button>

              <button
                id="bookmarks-tab-button"
                onClick={() => setActiveCategory('favoritos')}
                className={`px-4 py-2 rounded-full border text-xs font-extrabold flex items-center gap-2 transition shadow-sm cursor-pointer ${
                  activeCategory === 'favoritos'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/30'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Salvos</span>
                {bookmarkCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {bookmarkCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Localized Header AdSense Ad Slot */}
        <AdSenseBanner slot={SITE_CONFIG.adsense.slots.header} format="horizontal" />
      </div>
    </header>
  );
};
