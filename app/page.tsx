'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsItem } from '@/lib/types';
import { Header } from '@/components/Header';
import { BreakingTicker } from '@/components/BreakingTicker';
import { CategoryTabs } from '@/components/CategoryTabs';
import { FeaturedNews } from '@/components/FeaturedNews';
import { NewsCard } from '@/components/NewsCard';
import { Footer } from '@/components/Footer';
import { AdSenseBanner } from '@/components/AdSenseBanner';
import { WeatherCard } from '@/components/WeatherCard';
import { SITE_CONFIG } from '@/lib/site-config';
import { slugify } from '@/lib/slug';
import {
  getInitialTheme,
  getInitialFontSize,
  FontSizeOption,
} from '@/lib/accessibility';
import {
  LayoutGrid,
  List,
  RotateCw,
  AlertCircle,
  Newspaper,
  ArrowUp,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Filters & Views
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Back to top floating button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lastFetchTimestamp = useRef<number>(0);

  // Synchronize theme and accessibility font size
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDarkMode(getInitialTheme());
      setFontSize(getInitialFontSize());
    }, 0);

    const handleThemeChange = (e: any) => {
      if (typeof e.detail?.isDark === 'boolean') {
        setIsDarkMode(e.detail.isDark);
      }
    };
    const handleFontChange = (e: any) => {
      if (e.detail?.size) {
        setFontSize(e.detail.size);
      }
    };

    window.addEventListener('portal_theme_change', handleThemeChange);
    window.addEventListener('portal_fontsize_change', handleFontChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('portal_theme_change', handleThemeChange);
      window.removeEventListener('portal_fontsize_change', handleFontChange);
    };
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('portal_news_bookmarks');
        if (saved) {
          setBookmarkedIds(JSON.parse(saved));
        }
      } catch {
        // ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Direct navigation to individual news page (replaces pop-up modal)
  const handleOpenNews = useCallback(
    (item: NewsItem) => {
      const targetSlug = item.slug || slugify(item.title, item.id);
      router.push(`/noticia/${encodeURIComponent(targetSlug)}`);
    },
    [router]
  );

  // If accessed with ?article= query parameter, redirect to the new dedicated news page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const targetParam = params.get('article');
    if (targetParam) {
      router.replace(`/noticia/${encodeURIComponent(targetParam)}`);
    }
  }, [router]);

  // Save bookmarks to localStorage
  const handleToggleBookmark = useCallback((item: NewsItem) => {
    setBookmarkedIds((prev) => {
      let updated: string[];
      if (prev.includes(item.id)) {
        updated = prev.filter((id) => id !== item.id);
      } else {
        updated = [...prev, item.id];
      }
      try {
        localStorage.setItem('portal_news_bookmarks', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Fetch live news from internal API
  const fetchNews = useCallback(
    async (category: string = 'all', isUserExplicit: boolean = false, isBackgroundPoll: boolean = false) => {
      if (isUserExplicit) {
        setIsRefreshing(true);
      } else if (!isBackgroundPoll) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'all' && category !== 'favoritos') {
          queryParams.set('category', category);
        }
        if (isUserExplicit) {
          queryParams.set('refresh', 'true');
        }

        const url = `/api/news?${queryParams.toString()}`;
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data.items)) {
          setNews(data.items);
          lastFetchTimestamp.current = Date.now();

          const now = new Date();
          const timeFormatted = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastUpdatedTime(timeFormatted);
        } else {
          throw new Error('Formato inválido de resposta.');
        }
      } catch (err: any) {
        console.error('Falha ao carregar notícias:', err);
        if (!isBackgroundPoll) {
          setError(
            'Não foi possível atualizar as notícias no momento. Verifique sua conexão e tente novamente.'
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews(activeCategory, false, false);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeCategory, fetchNews]);

  // Filter news by search query, bookmarks, and category
  const filteredNews = useMemo(() => {
    let result = news;

    if (activeCategory === 'favoritos') {
      result = result.filter((item) => bookmarkedIds.includes(item.id));
    } else if (activeCategory !== 'all') {
      const normActive = activeCategory.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const matched = result.filter((item) => {
        const normCat = (item.category || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const normOrig = (item.originalCategory || item.categoryId || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        return (
          normCat === normActive ||
          normOrig === normActive ||
          normCat.includes(normActive) ||
          normActive.includes(normCat) ||
          normOrig.includes(normActive)
        );
      });
      result = matched.length > 0 ? matched : result;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.author && item.author.toLowerCase().includes(q))
      );
    }

    return result;
  }, [news, activeCategory, searchQuery, bookmarkedIds]);

  // Featured news item (highest impact story)
  const featuredItem = useMemo(() => {
    if (filteredNews.length === 0) return null;
    return filteredNews[0];
  }, [filteredNews]);

  // Remaining news items
  const remainingNews = useMemo(() => {
    if (filteredNews.length <= 1) return [];
    return filteredNews.slice(1);
  }, [filteredNews]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [news]);

  return (
    <div className={`min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onRefresh={() => fetchNews(activeCategory, true, false)}
        isLoading={isLoading || isRefreshing}
        bookmarkCount={bookmarkedIds.length}
      />

      {/* Breaking News Ticker (G1 Live Ticker Style) */}
      <BreakingTicker news={news} onSelectNews={handleOpenNews} />

      {/* Categories Horizontal Navigation Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Weather & Regional Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
              Acompanhe as principais informações de economia, justiça, política e acontecimentos do Brasil
            </h2>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            {/* Weather Card with dynamic current condition theme */}
            <WeatherCard />
          </div>
        </div>

        {/* Controls & View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              {activeCategory === 'all'
                ? 'Todas as Notícias'
                : activeCategory === 'favoritos'
                ? 'Sua Lista de Salvos'
                : activeCategory}
            </h2>

            {lastUpdatedTime && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Atualizado ({lastUpdatedTime})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Refresh Button */}
            <button
              onClick={() => fetchNews(activeCategory, true, false)}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shadow-sm text-xs font-bold flex items-center gap-1.5 px-3"
              title="Atualizar Notícias"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-red-600 ${
                  isLoading || isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden md:inline">Atualizar</span>
            </button>

            {/* View Mode Switcher */}
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Exibição:</span>
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full p-1 shadow-sm">
              <button
                id="grid-view-button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
                title="Modo Grade Editorial"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grade</span>
              </button>
              <button
                id="compact-view-button"
                onClick={() => setViewMode('compact')}
                className={`p-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
                title="Modo Lista Compacta"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-between text-red-700 dark:text-red-300 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchNews(activeCategory, true, false)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && news.length === 0 ? (
          <div className="space-y-6">
            <div className="w-full h-80 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
              {activeCategory === 'favoritos'
                ? 'Nenhuma matéria salva ainda'
                : 'Nenhuma matéria encontrada'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-2">
              {activeCategory === 'favoritos'
                ? 'Clique no ícone de marcador em qualquer notícia para salvá-la aqui para ler mais tarde.'
                : 'Tente alterar a categoria ou realizar uma busca com outros termos.'}
            </p>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="mt-6 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition shadow cursor-pointer"
              >
                Ver Todas as Notícias
              </button>
            )}
          </div>
        ) : (
          /* News Feed Content - G1 Inspired Editorial Organization */
          <>
            {/* Grand Lead Editorial Headline Package */}
            {viewMode === 'grid' && featuredItem && !searchQuery && (
              <FeaturedNews
                item={featuredItem}
                secondaryItems={remainingNews.slice(0, 2)}
                onSelectNews={handleOpenNews}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.includes(featuredItem.id)}
                onReadAudio={handleOpenNews}
                fontSize={fontSize}
              />
            )}

            {/* Localized In-Feed AdSense Banner */}
            <AdSenseBanner slot={SITE_CONFIG.adsense.slots.sidebar} format="auto" />

            {/* Editorial Layout: Main Feed Column (8 cols) + G1 Lateral Rail (4 cols) */}
            {viewMode === 'grid' && !searchQuery ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Feed Column - 8 Cols */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-red-600">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-sm inline-block" />
                      Últimas Notícias
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      Cobertura apurada e contínua
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {remainingNews.slice(2, 14).map((item) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        onSelectNews={handleOpenNews}
                        onToggleBookmark={handleToggleBookmark}
                        isBookmarked={bookmarkedIds.includes(item.id)}
                        onReadAudio={handleOpenNews}
                        viewMode="grid"
                        fontSize={fontSize}
                      />
                    ))}
                  </div>

                  {/* Further editorial coverage */}
                  {remainingNews.length > 14 && (
                    <div className="pt-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
                        <span className="text-xs font-black uppercase text-slate-600 dark:text-zinc-400 tracking-wider">
                          Mais Notícias e Análises
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {remainingNews.slice(14).map((item) => (
                          <NewsCard
                            key={item.id}
                            item={item}
                            onSelectNews={handleOpenNews}
                            onToggleBookmark={handleToggleBookmark}
                            isBookmarked={bookmarkedIds.includes(item.id)}
                            onReadAudio={handleOpenNews}
                            viewMode="compact"
                            fontSize={fontSize}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lateral Column (G1 Sidebar Style) - 4 Cols */}
                <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  {/* Mais Lidas • Ranking Editorial (G1 Style with Brand Red Numerals) */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <span>Mais Lidas • Em Alta</span>
                      </h3>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                        Ranking
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {remainingNews.slice(0, 5).map((popItem, rankIdx) => (
                        <div
                          key={popItem.id}
                          onClick={() => handleOpenNews(popItem)}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 cursor-pointer group"
                        >
                          <span className="w-7 h-7 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                            {rankIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-extrabold uppercase text-red-600 tracking-wider">
                              {popItem.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2 mt-0.5 font-sans">
                              {popItem.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" /> {popItem.timeAgo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar AdSense Banner Unit */}
                  <AdSenseBanner slot={SITE_CONFIG.adsense.slots.sidebar} format="rectangle" />

                  {/* Plantão Editorial Radar */}
                  <div className="bg-gradient-to-br from-red-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                      <Compass className="w-4 h-4 text-red-600" />
                      <span>Plantão Portal News</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      Acompanhe alertas imediatos, análises econômicas e coberturas dos principais tribunais e órgãos oficiais em tempo real.
                    </p>
                    <button
                      onClick={() => setActiveCategory('all')}
                      className="w-full py-2 bg-white dark:bg-zinc-800 hover:bg-red-600 hover:text-white border border-red-200 dark:border-zinc-700 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition shadow-xs text-center cursor-pointer"
                    >
                      Ver Todas as Editorias
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              /* Compact or Filtered Stream */
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-3'
                }
              >
                {filteredNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onSelectNews={handleOpenNews}
                    onToggleBookmark={handleToggleBookmark}
                    isBookmarked={bookmarkedIds.includes(item.id)}
                    onReadAudio={handleOpenNews}
                    viewMode={viewMode}
                    fontSize={fontSize}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveCategory={setActiveCategory} />
    </div>
  );
}
