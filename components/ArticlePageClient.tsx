'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsItem } from '@/lib/types';
import { OptimizedImage } from './OptimizedImage';
import { AdSenseBanner } from './AdSenseBanner';
import { WeatherCard } from './WeatherCard';
import { Header } from './Header';
import { BreakingTicker } from './BreakingTicker';
import { Footer } from './Footer';
import { SITE_CONFIG } from '@/lib/site-config';
import { slugify } from '@/lib/slug';
import { removeTruncationMarkers } from '@/lib/sanitizer';
import {
  applyFontSize,
  applyTheme,
  getInitialFontSize,
  getInitialTheme,
  FontSizeOption,
} from '@/lib/accessibility';
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  Share2,
  Play,
  Pause,
  Clock,
  Check,
  Copy,
  Volume2,
  TrendingUp,
  ListChecks,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  Compass,
} from 'lucide-react';

interface ArticlePageClientProps {
  item: NewsItem;
  relatedNews: NewsItem[];
  topNews: NewsItem[];
  allNews: NewsItem[];
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({
  item,
  relatedNews,
  topNews,
  allNews,
}) => {
  const router = useRouter();

  // Dark mode & font size with global accessibility synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [searchQuery, setSearchQuery] = useState('');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const isBookmarked = bookmarkedIds.includes(item.id);

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [audioProvider, setAudioProvider] = useState<'elevenlabs' | 'browser'>('browser');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // HTMLAudio element ref
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  // Dynamic article body with seamless enrichment
  const [articleContent, setArticleContent] = useState<string>(
    item.contentHtml || item.summary || item.title || ''
  );

  // Background check for complete article body
  useEffect(() => {
    if (item.link && item.link.startsWith('http')) {
      const current = (item.contentHtml || item.summary || '').trim();
      if (current.length < 400 || current.includes('[…]') || current.includes('...')) {
        fetch(
          `/api/news/article?id=${encodeURIComponent(item.id)}&link=${encodeURIComponent(
            item.link
          )}&title=${encodeURIComponent(item.title)}`
        )
          .then((r) => r.json())
          .then((data) => {
            if (data?.content && data.content.length > current.length) {
              setArticleContent(data.content);
            }
          })
          .catch(() => {});
      }
    }
  }, [item.id, item.link, item.contentHtml, item.summary, item.title]);

  // Floating back to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load bookmarks on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('portal_news_bookmarks');
        if (saved) {
          setBookmarkedIds(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }, 0);

    // Scroll listener for back to top
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  // Compute key takeaway AI bullet points for the story
  const aiBulletPoints = React.useMemo(() => {
    const raw = (item.summary || articleContent || item.title || '').trim();
    const clean = removeTruncationMarkers(raw);
    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && !s.includes('http') && !s.includes('@'));

    if (sentences.length >= 2) {
      return sentences.slice(0, 3);
    }
    if (clean.length > 30) {
      return [clean];
    }
    return [
      `Cobertura especial sobre ${item.category} com apuração atualizada e verificação editorial contínua.`,
      `Acompanhamento dos principais desdobramentos oficiais diretamente pelas fontes homologadas.`,
    ];
  }, [item.summary, articleContent, item.title, item.category]);

  // Check audio provider
  useEffect(() => {
    fetch('/api/audio')
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled && data.provider === 'elevenlabs') {
          setAudioProvider('elevenlabs');
        } else {
          setAudioProvider('browser');
        }
      })
      .catch(() => setAudioProvider('browser'));
  }, []);

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
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
  };

  // Audio Playback
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    const textToRead = `${item.title}. ${item.summary}. ${articleContent || item.contentHtml || ''}`
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 3000);

    if (audioProvider === 'elevenlabs') {
      try {
        setIsGeneratingAudio(true);
        const res = await fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToRead }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('audio/mpeg')) {
          const blob = await res.blob();
          if (audioBlobUrlRef.current) {
            URL.revokeObjectURL(audioBlobUrlRef.current);
          }
          const audioUrl = URL.createObjectURL(blob);
          audioBlobUrlRef.current = audioUrl;

          if (!audioElementRef.current) {
            audioElementRef.current = new Audio();
          }

          audioElementRef.current.src = audioUrl;
          audioElementRef.current.playbackRate = speechRate;
          audioElementRef.current.onended = () => setIsPlayingAudio(false);
          audioElementRef.current.onerror = () => {
            setIsPlayingAudio(false);
            playWithBrowserSpeech(textToRead);
          };

          await audioElementRef.current.play();
          setIsPlayingAudio(true);
          setIsGeneratingAudio(false);
          return;
        }
      } catch (e) {
        console.warn('ElevenLabs speech failed, falling back to Web Speech:', e);
      } finally {
        setIsGeneratingAudio(false);
      }
    }

    playWithBrowserSpeech(textToRead);
  };

  const playWithBrowserSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = speechRate;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleSpeedChange = () => {
    const nextRate = speechRate === 1 ? 1.25 : speechRate === 1.25 ? 1.5 : 1;
    setSpeechRate(nextRate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextRate;
    }
  };

  // Copy link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Font size classes
  const fontClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-relaxed',
    xlarge: 'text-xl sm:text-2xl leading-relaxed',
  };

  // Break text or HTML into clean, well-spaced journalistic paragraphs
  const rawText = (articleContent || item.contentHtml || item.summary || item.title || '').trim();
  const paragraphs = (() => {
    let list: string[] = [];
    if (/<p[^>]*>/i.test(rawText)) {
      list = rawText
        .split(/<\/p>/i)
        .map((p) => p.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim());
    } else {
      list = rawText.split(/\n\s*\n|\r?\n/).map((p) => p.trim());
    }
    return list
      .map((p) => removeTruncationMarkers(p))
      .filter((p) => p.length > 0);
  })();

  // Format publication date in pt-BR
  const formattedDate = (() => {
    try {
      const d = new Date(item.isoDate || item.pubDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      // ignore
    }
    return item.timeAgo;
  })();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className={`min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Global Portal Header */}
      <Header
        activeCategory={item.category}
        setActiveCategory={(cat) => router.push(cat === 'all' ? '/' : `/?category=${encodeURIComponent(cat)}`)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onRefresh={() => router.refresh()}
        isLoading={false}
        bookmarkCount={bookmarkedIds.length}
        onOpenFeedManager={() => router.push('/')}
      />

      {/* Breaking Ticker */}
      <BreakingTicker
        news={allNews}
        onSelectNews={(clicked) => router.push(`/noticia/${clicked.slug || slugify(clicked.title, clicked.id)}`)}
      />

      {/* Main Reading Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para todas as notícias</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Editoria:</span>
            <Link
              href={`/?category=${encodeURIComponent(item.category)}`}
              className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-600 hover:text-white transition uppercase font-extrabold text-[10px] tracking-wider"
            >
              {item.category}
            </Link>
          </div>
        </div>

        {/* 12-Column Editorial Grid (G1 Style: 8 cols article + 4 cols sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Article Reading Column - 8 Cols */}
          <article className="lg:col-span-8 space-y-6">
            {/* Category Tag */}
            <div>
              <span className="inline-block text-xs sm:text-sm font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-3 py-1 rounded-full">
                {item.category}
              </span>
            </div>

            {/* Headline Title (Impactful G1 Sans-Serif Typography) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-slate-900 dark:text-zinc-50 leading-[1.12]">
              {item.title}
            </h1>

            {/* Subtitle / Lead (Linha Fina) */}
            {item.summary && (
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {removeTruncationMarkers(item.summary)}
              </p>
            )}

            {/* Publication Metadata & Author Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  {item.author || 'Redação Portal News'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {item.timeAgo}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                <BookOpen className="w-3 h-3" />
                <span>Matéria Completa</span>
              </div>
            </div>

            {/* Action Toolbar: Audio, Bookmark, Share, Font Resizer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
              {/* Audio Listen Button */}
              <div className="flex items-center gap-2">
                <button
                  id="listen-article-button"
                  onClick={handleToggleAudio}
                  disabled={isGeneratingAudio}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isPlayingAudio ? 'Pausar Áudio' : 'Ouvir Notícia em Áudio'}
                >
                  {isGeneratingAudio ? (
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  <span>{isGeneratingAudio ? 'Gerando...' : isPlayingAudio ? 'Pausar' : 'Ouvir Matéria'}</span>
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleSpeedChange}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                    title="Velocidade de Reprodução"
                  >
                    {speechRate}x
                  </button>
                )}
              </div>

              {/* Bookmark & Social Share */}
              <div className="flex items-center gap-2">
                {/* Font Size Adjusters */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      setFontSize('normal');
                      applyFontSize('normal');
                    }}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === 'normal' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Fonte Padrão (100%)"
                  >
                    A
                  </button>
                  <button
                    onClick={() => {
                      setFontSize('large');
                      applyFontSize('large');
                    }}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === 'large' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Fonte Média (115%)"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => {
                      setFontSize('xlarge');
                      applyFontSize('xlarge');
                    }}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === 'xlarge' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Fonte Grande (130%)"
                  >
                    A++
                  </button>
                </div>

                {/* Bookmark Button */}
                <button
                  id="article-bookmark-button"
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:text-amber-500'
                  }`}
                  title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Notícia'}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>

                {/* Copy Link Button */}
                <button
                  id="article-copy-link-button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-red-600 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Copiar Link da Notícia"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
                </button>
              </div>
            </div>

            {/* Resumo por IA da Notícia / Síntese Editorial G1 */}
            {aiBulletPoints.length > 0 && (
              <div className="bg-red-50/40 dark:bg-zinc-900/70 border-l-4 border-red-600 rounded-r-2xl p-5 border-y border-r border-red-100 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-red-600" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
                      Resumo da Notícia
                    </h2>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-red-200 dark:border-zinc-700 shadow-2xs">
                    Síntese Inteligente
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                  {aiBulletPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                      <span className="leading-relaxed font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Featured Photo (G1 Proportion) */}
            {item.imageUrl && (
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-950 shadow-sm">
                <div className="relative w-full h-[300px] sm:h-[420px] md:h-[480px]">
                  <OptimizedImage
                    src={item.imageUrl}
                    alt={item.title}
                    priority={true}
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 sm:px-5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 italic">
                  Foto: {item.imageCaption || `Registro editorial — ${item.title}`}
                </div>
              </div>
            )}

            {/* In-Article AdSense Banner Slot */}
            <AdSenseBanner slot={SITE_CONFIG.adsense.slots.inArticle} format="auto" />

            {/* Complete Article Body Text */}
            <div className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-zinc-200 ${fontClasses[fontSize]}`}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="mb-5 leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="mb-5 leading-relaxed text-justify">
                  {item.title}
                </p>
              )}
            </div>

            {/* Share and Source Reference Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Compartilhar:</span>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(item.title + ' ' + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1"
                >
                  X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  Facebook
                </a>
              </div>

              {item.link && item.link.startsWith('http') && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1"
                >
                  <span>Ver publicação original na fonte</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Leia Também / Notícias Relacionadas (G1 Editorial Grid) */}
            {relatedNews.length > 0 && (
              <div className="pt-8 border-t-2 border-red-600 space-y-4">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-sm inline-block" />
                  Leia Também • Cobertura Relacionada
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedNews.slice(0, 3).map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/noticia/${rel.slug || slugify(rel.title, rel.id)}`}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 hover:border-red-500 transition-all flex flex-col justify-between group shadow-xs"
                    >
                      <div>
                        {rel.imageUrl && (
                          <div className="h-32 rounded-xl overflow-hidden mb-3 bg-zinc-950">
                            <OptimizedImage
                              src={rel.imageUrl}
                              alt={rel.title}
                              sizes="250px"
                              className="group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                          {rel.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-red-600 transition leading-snug line-clamp-3 mt-1">
                          {rel.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-red-600 font-bold mt-3 block group-hover:underline">
                        Ler matéria →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Lateral Column - 4 Cols (G1 Sidebar Style) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Mais Lidas • Ranking 1 a 5 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>Mais Lidas no Portal</span>
                </h3>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                  Em Alta
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {topNews.slice(0, 5).map((popItem, rankIdx) => (
                  <Link
                    key={popItem.id}
                    href={`/noticia/${popItem.slug || slugify(popItem.title, popItem.id)}`}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 group cursor-pointer block"
                  >
                    <span className="w-7 h-7 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {rankIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-red-600 tracking-wider">
                        {popItem.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2 mt-0.5">
                        {popItem.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {popItem.timeAgo}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar AdSense Banner Unit */}
            <AdSenseBanner slot={SITE_CONFIG.adsense.slots.sidebar} format="rectangle" />

            {/* Weather Card */}
            <WeatherCard />

            {/* Plantão Editorial Banner */}
            <div className="bg-gradient-to-br from-red-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                <Compass className="w-4 h-4 text-red-600" />
                <span>Plantão e Edição Completa</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Informações checadas e apuração contínua sobre política, economia, justiça e os acontecimentos do Brasil.
              </p>
              <Link
                href="/"
                className="block w-full py-2 bg-white dark:bg-zinc-800 hover:bg-red-600 hover:text-white border border-red-200 dark:border-zinc-700 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition shadow-xs text-center cursor-pointer"
              >
                Página Inicial do Portal
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Subir ao Topo Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ring-4 ring-white/30 dark:ring-zinc-900/60 cursor-pointer"
          title="Subir ao topo"
          aria-label="Subir ao topo"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Global Footer */}
      <Footer setActiveCategory={(cat) => router.push(cat === 'all' ? '/' : `/?category=${encodeURIComponent(cat)}`)} />
    </div>
  );
};
