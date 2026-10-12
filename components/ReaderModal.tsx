'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '@/lib/types';
import { OptimizedImage } from './OptimizedImage';
import { AdSenseBanner } from './AdSenseBanner';
import { SITE_CONFIG } from '@/lib/site-config';
import { slugify } from '@/lib/slug';
import {
  X,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  Play,
  Pause,
  Clock,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  Volume2,
  Radio,
} from 'lucide-react';

interface AISummaryData {
  enabled?: boolean;
  executiveSummary: string;
  keyPoints: string[];
  context: string;
  sentiment?: string;
  topics: string[];
}

interface ReaderModalProps {
  item: NewsItem | null;
  onClose: () => void;
  onToggleBookmark: (item: NewsItem) => void;
  isBookmarked: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  item,
  onClose,
  onToggleBookmark,
  isBookmarked,
  fontSize,
}) => {
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [audioProvider, setAudioProvider] = useState<'elevenlabs' | 'browser'>('browser');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // ElevenLabs HTMLAudio element ref
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  const stopAudio = () => {
    // 1. Stop Elevenlabs audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    // 2. Stop Web Speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Check ElevenLabs availability on mount
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

  // Check AI summary availability and load for current article
  useEffect(() => {
    let isCancelled = false;

    if (item) {
      // First check if AI summary endpoint is configured
      fetch('/api/news/ai-summary')
        .then((r) => r.json())
        .then((status) => {
          if (isCancelled) return;
          if (status.enabled) {
            setIsAiEnabled(true);
            return fetch('/api/news/ai-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: item.title,
                summary: item.summary,
                link: item.link,
              }),
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (!isCancelled && data && !data.error && data.enabled !== false) {
                  setAiSummary(data);
                }
              });
          } else {
            setIsAiEnabled(false);
            setAiSummary(null);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setIsAiEnabled(false);
            setAiSummary(null);
          }
        });
    }

    return () => {
      isCancelled = true;
      stopAudio();
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
    };
  }, [item]);

  if (!item) return null;

  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  };

  // Internal Site Article URL for sharing and copying (uses clean SEO slug)
  const getSiteArticleUrl = () => {
    const slug = item.slug || slugify(item.title, item.id);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/?article=${encodeURIComponent(slug)}`;
    }
    return `${SITE_CONFIG.domain}/?article=${encodeURIComponent(slug)}`;
  };

  const handleToggleAudio = async () => {
    if (!item) return;

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    const textToRead = `${item.title}. ${item.summary}. ${
      aiSummary ? `Resumo: ${aiSummary.executiveSummary}` : ''
    }`;

    // If ElevenLabs is configured, synthesize via ElevenLabs API
    if (audioProvider === 'elevenlabs') {
      try {
        if (!audioBlobUrlRef.current) {
          setIsGeneratingAudio(true);
          const res = await fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToRead }),
          });

          if (!res.ok) throw new Error('Elevenlabs failed');
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await res.json();
            if (json.fallback === 'web-speech') {
              playWebSpeech(textToRead);
              setIsGeneratingAudio(false);
              return;
            }
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          audioBlobUrlRef.current = url;
          setIsGeneratingAudio(false);
        }

        if (audioBlobUrlRef.current) {
          if (!audioElementRef.current) {
            audioElementRef.current = new Audio(audioBlobUrlRef.current);
            audioElementRef.current.playbackRate = speechRate;
            audioElementRef.current.onended = () => setIsPlayingAudio(false);
            audioElementRef.current.onerror = () => {
              setIsPlayingAudio(false);
              playWebSpeech(textToRead);
            };
          }
          audioElementRef.current.playbackRate = speechRate;
          await audioElementRef.current.play();
          setIsPlayingAudio(true);
          return;
        }
      } catch (e) {
        console.warn('ElevenLabs failed, falling back to Web Speech API', e);
        setIsGeneratingAudio(false);
        playWebSpeech(textToRead);
        return;
      }
    }

    // Default Web Speech API
    playWebSpeech(textToRead);
  };

  const playWebSpeech = (text: string) => {
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

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = rate;
    }
    if (isPlayingAudio) {
      if (audioProvider === 'browser') {
        stopAudio();
        const textToRead = `${item.title}. ${item.summary}.`;
        playWebSpeech(textToRead);
      }
    }
  };

  // Copies the internal portal article link (NOT the upstream external source)
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const siteUrl = getSiteArticleUrl();
      navigator.clipboard.writeText(siteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShare = async () => {
    const siteUrl = getSiteArticleUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: siteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
              {item.category}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Fonte: {item.source || 'Portal News'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(item)}
              className={`p-2 rounded-full border transition flex items-center justify-center ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
              title={isBookmarked ? 'Remover dos Salvos' : 'Salvar Matéria'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
              title="Compartilhar Link da Notícia"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          {/* Article Header */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-zinc-950 dark:text-zinc-50 leading-tight">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-900 dark:text-zinc-200 font-bold">{item.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.timeAgo}
              </span>
            </div>
          </div>

          {/* Audio Player Bar (ElevenLabs or Web Speech) */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                id="reader-speech-play-button"
                onClick={handleToggleAudio}
                disabled={isGeneratingAudio}
                className={`w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow transition ${
                  isGeneratingAudio ? 'opacity-70 animate-pulse' : ''
                }`}
              >
                {isGeneratingAudio ? (
                  <Radio className="w-5 h-5 animate-spin" />
                ) : isPlayingAudio ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <span>Ouvir Leitura da Notícia</span>
                  {audioProvider === 'elevenlabs' ? (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                      ElevenLabs IA
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                      (Voz Web)
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  {isGeneratingAudio
                    ? 'Sintetizando áudio em alta definição...'
                    : 'Leitura completa em português'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-medium">Velocidade:</span>
              {[0.9, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${
                    speechRate === rate
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Featured Image & Caption (Only if original image exists from source) */}
          {item.imageUrl && (
            <div className="space-y-1.5">
              <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[380px] bg-zinc-950 shadow-md relative">
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.title}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
              {item.imageCaption && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic font-sans leading-relaxed border-l-2 border-red-500/80 pl-2.5 py-0.5 mt-1">
                  Foto: {item.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* AI Executive Summary Block (ONLY SHOWN IF AI API ENDPOINT & KEY ARE CONFIGURED) */}
          {isAiEnabled && aiSummary && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-zinc-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-zinc-900 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm sm:text-base text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                    Resumo Inteligente da Notícia
                  </h3>
                </div>
                {aiSummary.sentiment &&
                  aiSummary.sentiment.trim().length > 0 &&
                  !aiSummary.sentiment.toLowerCase().includes('neutro') && (
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        aiSummary.sentiment.toLowerCase().includes('alerta')
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {aiSummary.sentiment}
                    </span>
                  )}
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed bg-white/70 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    &quot;{aiSummary.executiveSummary}&quot;
                  </p>
                </div>

                {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2 uppercase tracking-wide text-[11px]">
                      Pontos Centrais:
                    </h4>
                    <ul className="space-y-2">
                      {aiSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.topics && aiSummary.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {aiSummary.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AdSense In-Article Ad Unit */}
          <AdSenseBanner slot={SITE_CONFIG.adsense.slots.inArticle} format="auto" />

          {/* Main Full Article Body Text - JUSTIFIED TEXT AS REQUESTED */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-4">
              Conteúdo da Matéria:
            </h3>
            <div className={`prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 ${fontClasses[fontSize]}`}>
              {(() => {
                const rawText = (item.contentHtml || item.summary || item.title || '').trim();
                const paragraphs = rawText
                  .split(/\n\s*\n|\r?\n/)
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0);

                if (paragraphs.length === 0) {
                  return (
                    <p className="mb-4 leading-relaxed text-justify">
                      {item.title}
                    </p>
                  );
                }

                return paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="mb-4 leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ));
              })()}
            </div>
          </div>

          {/* Share & Source Link Footer */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-200 transition flex items-center gap-1.5 shadow-sm"
                title="Copiar link desta matéria no Portal News"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link da Notícia'}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </button>
            </div>

            {/* Only element linking to external original source */}
            {item.link && item.link !== '#' && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-red-600 transition flex items-center gap-1"
                title="Acessar publicação original no site da fonte"
              >
                <span>Acessar fonte original ({item.source})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
