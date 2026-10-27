import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import { Tv, Play, ChevronRight, Clock, Eye, Calendar, Sparkles } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/videos`;

  return {
    title: `TV Goiânia & Vídeos • Acervo Audiovisual Oficial | ${SITE_CONFIG.name}`,
    description:
      'Assista a reportagens especiais, entrevistas exclusivas, transmissões e análises da redação do Portal News e da TV Goiânia sem cookies de rastreamento.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `TV Goiânia & Vídeos | ${SITE_CONFIG.name}`,
      description: 'Acervo audiovisual oficial com reportagens exclusivas e cobertura jornalística em vídeo.',
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: `${domain}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `TV Goiânia & Vídeos - ${SITE_CONFIG.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `TV Goiânia & Vídeos • ${SITE_CONFIG.name}`,
      description: 'Reportagens e vídeos jornalísticos oficiais.',
    },
  };
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  date: string;
  embedId: string;
  description: string;
}

const FEATURED_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Análise Econômica: Perspectivas para a inflação, juros e investimentos no país',
    category: 'Economia',
    duration: '14:20',
    date: 'Hoje',
    embedId: 'dQw4w9WgXcQ', // Placeholder de vídeo incorporado via youtube-nocookie
    description: 'Especialistas analisam os rumos da economia nacional e os reflexos nas finanças das famílias brasileiras.',
  },
  {
    id: 'vid-2',
    title: 'Bastidores de Brasília: As articulações políticas e as prioridades do Congresso',
    category: 'Política',
    duration: '18:45',
    date: 'Ontem',
    embedId: 'kJQP7kiw5Fk',
    description: 'Correspondentes em Brasília trazem os bastidores das votações de projetos estratégicos.',
  },
  {
    id: 'vid-3',
    title: 'Justiça e Cidadania: Entrevista sobre os avanços nos direitos digitais e LGPD',
    category: 'Justiça',
    duration: '22:10',
    date: 'Há 2 dias',
    embedId: 'fJ9rUzIMcZQ',
    description: 'Debate aprofundado com juristas sobre a proteção da privacidade e segurança institucional.',
  },
  {
    id: 'vid-4',
    title: 'Giro dos Esportes: O balanço da rodada do Brasileirão e os confrontos da Libertadores',
    category: 'Esporte',
    duration: '12:30',
    date: 'Há 3 dias',
    embedId: '3JZ_D3ELwOQ',
    description: 'Gols, melhores momentos e análises táticas das principais equipes do futebol nacional.',
  },
  {
    id: 'vid-5',
    title: 'Inovação e Futuro: O impacto da inteligência artificial na educação e no mercado de trabalho',
    category: 'Tecnologia e Games',
    duration: '16:05',
    date: 'Há 4 dias',
    embedId: 'L_LUpnjgPso',
    description: 'Pesquisadores demonstram novas ferramentas tecnológicas e o potencial produtivo no Brasil.',
  },
  {
    id: 'vid-6',
    title: 'Panorama Regional: Obras de infraestrutura e turismo no Norte e Centro-Oeste',
    category: 'Regiões',
    duration: '15:50',
    date: 'Há 5 dias',
    embedId: '9bZkp7q19f0',
    description: 'Reportagem especial percorre projetos de desenvolvimento sustentável e mobilidade urbana.',
  },
];

export default function VideosPage() {
  const domain = getBaseUrl();
  const mainVideo = FEATURED_VIDEOS[0];
  const otherVideos = FEATURED_VIDEOS.slice(1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'TV e Vídeos - Acervo Audiovisual',
    url: `${domain}/videos`,
    description: 'Reportagens em vídeo e cobertura jornalística audiovisual do Portal News.',
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: FEATURED_VIDEOS.map((v, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: v.title,
        url: `${domain}/videos#${v.id}`,
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
      <CategoryTabs activeCategory="" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-10">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">TV &amp; Vídeos</span>
        </nav>

        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Tv className="w-3.5 h-3.5" />
            <span>TV &amp; Conteúdo Audiovisual</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            TV Goiânia &amp; Vídeos • Acervo Audiovisual
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Acompanhe nossas reportagens exclusivas, debates e análises em vídeo da TV Goiânia e redação do Portal News.
            Reprodução otimizada sem cookies invasivos de rastreamento.
          </p>
        </div>

        {/* Vídeo Principal em Destaque */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Destaque Audiovisual</span>
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mainVideo.duration}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {mainVideo.date}</span>
            </div>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${mainVideo.embedId}?rel=0&modestbranding=1`}
              title={mainVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {mainVideo.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 font-sans">
              {mainVideo.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {mainVideo.description}
            </p>
          </div>
        </div>

        {/* Grid de Demais Vídeos do Acervo */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-sans flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            <span>Mais Reportagens e Entrevistas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherVideos.map((video) => (
              <div
                key={video.id}
                id={video.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.embedId}?rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-bold text-red-600 dark:text-red-400 uppercase text-[10px] tracking-wider">
                      {video.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" /> {video.duration}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
