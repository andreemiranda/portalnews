'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { NewsItem, FeedSource } from '@/lib/types';
import { DEFAULT_FEEDS } from '@/lib/feeds';
import { Header } from '@/components/Header';
import { BreakingTicker } from '@/components/BreakingTicker';
import { CategoryTabs } from '@/components/CategoryTabs';
import { FeaturedNews } from '@/components/FeaturedNews';
import { NewsCard } from '@/components/NewsCard';
import { ReaderModal } from '@/components/ReaderModal';
import { FeedManagerModal } from '@/components/FeedManagerModal';
import { Footer } from '@/components/Footer';
import { AdSenseBanner } from '@/components/AdSenseBanner';
import { WeatherCard } from '@/components/WeatherCard';
import { SITE_CONFIG } from '@/lib/site-config';
import { slugify } from '@/lib/slug';
import {
  LayoutGrid,
  List,
  RotateCw,
  AlertCircle,
  Newspaper,
  Radio,
} from 'lucide-react';

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pendingNews, setPendingNews] = useState<NewsItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Filters & Views
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Reader Modal State
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Feed Manager State (Read-only verified sources viewer)
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState<boolean>(false);
  const [customFeeds] = useState<FeedSource[]>(DEFAULT_FEEDS);

  const lastFetchTimestamp = useRef<number>(0);

  // Load bookmarks on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem('portal_news_bookmarks');
        if (saved) {
          setBookmarkedIds(JSON.parse(saved));
        }
      } catch {
        // ignore storage errors
      }
    });
  }, []);

  // Synchronize ?article= URL query parameter with selectedNews modal using clean slug
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (selectedNews) {
      const url = new URL(window.location.href);
      const articleSlug = selectedNews.slug || slugify(selectedNews.title, selectedNews.id);
      url.searchParams.set('article', articleSlug);
      window.history.replaceState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      if (url.searchParams.has('article')) {
        url.searchParams.delete('article');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [selectedNews]);

  // Check URL on initial news load to open deep-linked article (matches slug, id, or legacy params)
  useEffect(() => {
    if (typeof window === 'undefined' || news.length === 0 || selectedNews) return;

    const params = new URLSearchParams(window.location.search);
    const targetParam = params.get('article');
    if (targetParam) {
      const decodedTarget = decodeURIComponent(targetParam).toLowerCase().trim();
      const found = news.find(
        (item) =>
          (item.slug && item.slug.toLowerCase() === decodedTarget) ||
          (item.title && slugify(item.title) === decodedTarget) ||
          item.id.toLowerCase() === decodedTarget ||
          item.id === targetParam ||
          (item.link && item.link === targetParam)
      );
      if (found) {
        setTimeout(() => setSelectedNews(found), 0);
      }
    }
  }, [news, selectedNews]);

  // Save Bookmarks to LocalStorage
  const handleToggleBookmark = (item: NewsItem) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(item.id);
      const updated = exists ? prev.filter((id) => id !== item.id) : [...prev, item.id];
      try {
        localStorage.setItem('portal_news_bookmarks', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save bookmark to localStorage', e);
      }
      return updated;
    });
  };

  // Handler to apply real-time detected news when user explicitly wants to
  const applyPendingNews = useCallback(() => {
    if (pendingNews && pendingNews.length > 0) {
      setNews(pendingNews);
      setPendingNews(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pendingNews]);

  // Main News Fetcher function
  const fetchNews = useCallback(
    async (category = activeCategory, force = false, silent = false) => {
      if (!silent) {
        if (force) setIsRefreshing(true);
        else setIsLoading(true);
      }
      setError(null);

      try {
        const catParam = category === 'favoritos' ? 'all' : category;
        const cacheBuster = `_t=${Date.now()}`;
        const refreshParam = force ? '&refresh=true' : '';
        const url = `/api/news?category=${encodeURIComponent(catParam)}${refreshParam}&${cacheBuster}`;

        const res = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (!res.ok) throw new Error('Erro ao carregar feeds de notícias.');

        const data = await res.json();
        const incomingItems: NewsItem[] = data.items || [];

        if (silent) {
          // Em tempo real em segundo plano: NÃO troca de repente as notícias no feed!
          // Compara com os itens atuais. Se houver novidades, armazena em pendingNews
          // para serem aplicadas apenas se o usuário clicar ou na próxima troca de editoria.
          setNews((currentNews) => {
            if (incomingItems.length > 0 && currentNews.length > 0) {
              const currentIds = new Set(currentNews.map((i) => i.id));
              const hasNewArticles = incomingItems.some((i) => !currentIds.has(i.id));
              if (hasNewArticles || incomingItems[0]?.id !== currentNews[0]?.id) {
                setPendingNews(incomingItems);
              }
            }
            return currentNews; // Mantém o feed na tela 100% estável sem saltos
          });
        } else {
          // Troca imediatamente apenas quando atualizar a página, no reinício ou ao clicar em atualizar/trocar editoria
          setNews(incomingItems);
          setPendingNews(null);
        }

        lastFetchTimestamp.current = Date.now();

        const now = new Date();
        const formattedTime = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastUpdatedTime(formattedTime);
      } catch (err: any) {
        console.error('Failed to fetch news:', err);
        if (!silent) {
          setError(
            'Não foi possível conectar ao servidor de notícias. Tente novamente em instantes.'
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeCategory]
  );

  // Immediate fetch on initial mount and when active category changes (via click)
  useEffect(() => {
    let isMounted = true;

    const catParam = activeCategory === 'favoritos' ? 'all' : activeCategory;
    const cacheBuster = `_t=${Date.now()}`;
    const url = `/api/news?category=${encodeURIComponent(catParam)}&${cacheBuster}`;

    fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar feeds de notícias.');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setNews(data.items || []);
          setPendingNews(null);
          lastFetchTimestamp.current = Date.now();
          const now = new Date();
          const formattedTime = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastUpdatedTime(formattedTime);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch news:', err);
          setError(
            'Não foi possível conectar ao servidor de notícias. Tente novamente em instantes.'
          );
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  // Real-time automatic polling in background (every 50 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews(activeCategory, true, true);
    }, 50000);

    return () => clearInterval(interval);
  }, [activeCategory, fetchNews]);

  // Auto-refresh when tab gains focus or visibility returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastFetch = Date.now() - lastFetchTimestamp.current;
        if (timeSinceLastFetch > 30000) {
          fetchNews(activeCategory, true, true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [activeCategory, fetchNews]);

  // Dark Mode class toggle on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filtered News items
  const filteredNews = useMemo(() => {
    let list = [...news];

    // Filter by bookmarks tab
    if (activeCategory === 'favoritos') {
      list = list.filter((item) => bookmarkedIds.includes(item.id));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.author && item.author.toLowerCase().includes(q))
      );
    }

    return list;
  }, [news, activeCategory, searchQuery, bookmarkedIds]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: news.length,
      favoritos: bookmarkedIds.length,
    };

    news.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });

    return counts;
  }, [news, bookmarkedIds]);

  // Lead / Featured news article
  const featuredItem = filteredNews.length > 0 ? filteredNews[0] : null;
  const remainingNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div
      className={`min-h-screen bg-[#f1f3f6] dark:bg-[#121316] text-slate-900 dark:text-zinc-100 transition-colors font-sans ${
        isDarkMode ? 'dark' : ''
      }`}
      suppressHydrationWarning
    >
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        bookmarkCount={bookmarkedIds.length}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onRefresh={() => fetchNews(activeCategory, true, false)}
        isLoading={isLoading || isRefreshing}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenFeedManager={() => setIsFeedManagerOpen(true)}
        lastUpdatedTime={lastUpdatedTime}
      />

      {/* Breaking News Marquee */}
      <BreakingTicker news={news} onSelectNews={setSelectedNews} />

      {/* Category Navigation Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Real-time Toast Notification */}
      {realtimeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Radio className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold">{realtimeNotification}</span>
        </div>
      )}

      {/* Real-time New Articles Available Banner (Non-disruptive) */}
      {pendingNews && pendingNews.length > 0 && (
        <div className="sticky top-14 z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-3 animate-fadeIn">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-red-500/80">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-center sm:text-left">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
              </span>
              <span>Novas notícias recebidas em tempo real!</span>
              <span className="text-red-100 text-xs font-normal hidden md:inline">
                (O feed atual foi mantido intacto para sua leitura não ser interrompida)
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={applyPendingNews}
                className="bg-white text-red-700 hover:bg-zinc-100 px-4 py-1.5 rounded-xl text-xs font-black transition shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
              >
                Atualizar Feed Agora
              </button>
              <button
                onClick={() => setPendingNews(null)}
                className="text-red-200 hover:text-white text-xs px-2 py-1 cursor-pointer"
                title="Dispensar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Weather & Regional Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping" />
                Edição Nacional • Cobertura Contínua
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Cobertura Verificada • 24 Horas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-zinc-50 leading-tight">
              Acompanhe as principais informações de economia, justiça, política e acontecimentos do Brasil
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2">
              Notícias apuradas diretamente das fontes oficiais, com filtros por editorias e leitura em áudio.
            </p>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            {/* Weather Card with dynamic current condition theme */}
            <WeatherCard />
          </div>
        </div>

        {/* Controls & View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              {activeCategory === 'all'
                ? 'Todas as Notícias'
                : activeCategory === 'favoritos'
                ? 'Sua Lista de Salvos'
                : `Editoria: ${activeCategory}`}
            </h2>

            <span className="text-xs text-slate-500 font-extrabold bg-slate-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {filteredNews.length} matérias
            </span>

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
                className={`p-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
                title="Modo Grade Bento"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grade</span>
              </button>
              <button
                id="compact-view-button"
                onClick={() => setViewMode('compact')}
                className={`p-1.5 px-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'compact'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
                title="Modo Compacto"
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
                className="mt-6 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition shadow"
              >
                Ver Todas as Notícias
              </button>
            )}
          </div>
        ) : (
          /* News Feed Content */
          <>
            {/* Featured Article Section (Only shown in 'all' view or first load with grid view) */}
            {viewMode === 'grid' && featuredItem && !searchQuery && (
              <FeaturedNews
                item={featuredItem}
                secondaryItems={remainingNews.slice(0, 2)}
                onSelectNews={setSelectedNews}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.includes(featuredItem.id)}
                onReadAudio={setSelectedNews}
                fontSize={fontSize}
              />
            )}

            {/* Localized In-Feed AdSense Banner */}
            <AdSenseBanner slot={SITE_CONFIG.adsense.slots.sidebar} format="auto" />

            {/* Bento Grid or Compact Feed */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-3'
              }
            >
              {(viewMode === 'grid' && !searchQuery ? remainingNews.slice(2) : filteredNews).map(
                (item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onSelectNews={setSelectedNews}
                    onToggleBookmark={handleToggleBookmark}
                    isBookmarked={bookmarkedIds.includes(item.id)}
                    onReadAudio={setSelectedNews}
                    viewMode={viewMode}
                    fontSize={fontSize}
                  />
                )
              )}
            </div>
          </>
        )}
      </main>

      {/* Full Article Reader Modal with Audio Reader & Summarizer */}
      <ReaderModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={selectedNews ? bookmarkedIds.includes(selectedNews.id) : false}
        fontSize={fontSize}
      />

      {/* Official Verified Editorial Channels Modal */}
      <FeedManagerModal
        isOpen={isFeedManagerOpen}
        onClose={() => setIsFeedManagerOpen(false)}
        feeds={customFeeds}
      />

      {/* Footer */}
      <Footer setActiveCategory={setActiveCategory} />
    </div>
  );
}
