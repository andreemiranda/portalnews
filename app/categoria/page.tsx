import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { ALL_CATEGORIES, categorySlugify } from '@/lib/sources';
import { getLiveNews } from '@/lib/news-fetcher';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import {
  Layers,
  Landmark,
  TrendingUp,
  Scale,
  HeartPulse,
  GraduationCap,
  Palette,
  Trophy,
  Cpu,
  Newspaper,
  MapPin,
  Globe,
  ArrowRight,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/categoria`;

  return {
    title: `Editorias e Categorias de Notícias | ${SITE_CONFIG.name}`,
    description:
      'Arquivo completo de editorias do Portal News: política, economia, justiça, saúde, educação, esportes, tecnologia e estados brasileiros.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Editorias e Assuntos | ${SITE_CONFIG.name}`,
      description:
        'Acompanhe todas as áreas de cobertura jornalística independente do Portal News.',
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: `${domain}/og-image.png`,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Editorias e Assuntos | ${SITE_CONFIG.name}`,
      description: SITE_CONFIG.description,
    },
  };
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Política: 'Acompanhe as decisões dos Três Poderes, eleições, articulações partidárias e projetos de lei em Brasília e nos estados.',
  Economia: 'Indicadores financeiros, mercado de capitais, inflação, agronegócio, comércio exterior e finanças pessoais.',
  Justiça: 'Decisões do STF, STJ, tribunais regionais, Ministério Público, jurisprudência e segurança jurídica.',
  Saúde: 'Saúde pública, SUS, avanços da medicina, campanhas de vacinação, bem-estar e pesquisas científicas.',
  Educação: 'Ensino básico, superior, Enem, políticas pedagógicas, universidades federais e qualificação profissional.',
  Cultura: 'Música, cinema, literatura, teatro, patrimônio histórico e cobertura de manifestações culturais brasileiras.',
  Esporte: 'Futebol nacional e internacional, competições continentais, basquete, vôlei, automobilismo e modalidades olímpicas.',
  'Tecnologia e Games': 'Inovação, inteligência artificial, segurança cibernética, telecomunicações, startups e cultura gamer.',
  'Notícias Gerais': 'Fatos relevantes do cotidiano, prestação de serviços, cidadania e cobertura de interesse público.',
  Pará: 'Notícias de Belém e dos municípios paraenses, infraestrutura, desenvolvimento sustentável e eventos regionais.',
  Tocantins: 'Cobertura em tempo real de Palmas e do interior tocantinense, agronegócio, logística e administração pública.',
  Goiás: 'Fatos marcantes de Goiânia e das regiões goianas, agronegócio, indústria farmacêutica e turismo.',
  'Santa Catarina': 'Inovação, indústria, turismo litorâneo e desenvolvimento dos polos regionais catarinenses.',
  Mundo: 'Cenário geopolítico global, acordos comerciais, cúpulas internacionais e acontecimentos nos cinco continentes.',
};

function getCategoryIcon(catId: string) {
  switch (catId.toLowerCase()) {
    case 'política':
      return Landmark;
    case 'economia':
      return TrendingUp;
    case 'justiça':
      return Scale;
    case 'saúde':
      return HeartPulse;
    case 'educação':
      return GraduationCap;
    case 'cultura':
      return Palette;
    case 'esporte':
      return Trophy;
    case 'tecnologia e games':
      return Cpu;
    case 'notícias gerais':
      return Newspaper;
    case 'pará':
    case 'tocantins':
    case 'goiás':
    case 'santa catarina':
      return MapPin;
    case 'mundo':
      return Globe;
    default:
      return Layers;
  }
}

export default async function CategoriasIndexPage() {
  const domain = getBaseUrl();
  const allNews = await getLiveNews({ category: 'all' });

  // Calcular contagens reais de matérias ao vivo por categoria
  const countsMap: Record<string, number> = {};
  const sampleItemsMap: Record<string, typeof allNews> = {};

  allNews.forEach((item) => {
    const cat = item.category || 'Notícias Gerais';
    countsMap[cat] = (countsMap[cat] || 0) + 1;
    if (!sampleItemsMap[cat]) sampleItemsMap[cat] = [];
    if (sampleItemsMap[cat].length < 3) {
      sampleItemsMap[cat].push(item);
    }
  });

  const categoriesToDisplay = ALL_CATEGORIES.filter((c) => c.id !== 'all');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Arquivo de Editorias e Categorias',
    url: `${domain}/categoria`,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoriesToDisplay.map((cat, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: cat.name,
        url: `${domain}/categoria/${cat.slug || categorySlugify(cat.id)}`,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Breadcrumb Editorial */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Editorias</span>
        </nav>

        {/* Hero do Arquivo de Editorias */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Guia Editorial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Editorias e Cobertura Temática
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Navegue pelos temas de interesse do Portal News. Nossa equipe acompanha diariamente os
            fatos com rigor ético, clareza e compromisso com o interesse público.
          </p>
        </div>

        {/* Grid de Editorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesToDisplay.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const count = countsMap[cat.id] || cat.count || 10;
            const description = CATEGORY_DESCRIPTIONS[cat.id] || `Acompanhe as principais reportagens, análises e coberturas de ${cat.name}.`;
            const slug = cat.slug || categorySlugify(cat.id);
            const samples = sampleItemsMap[cat.id] || [];

            return (
              <div
                key={cat.id}
                className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold">
                      {count} {count === 1 ? 'matéria' : 'matérias'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>

                  {samples.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                        Em Destaque
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {samples.slice(0, 2).map((s) => (
                          <li key={s.id}>
                            <Link
                              href={`/noticia/${encodeURIComponent(s.slug || s.id)}`}
                              className="text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 line-clamp-1 transition flex items-center gap-1.5"
                            >
                              <FileText className="w-3 h-3 text-red-500 shrink-0" />
                              <span>{s.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800/60">
                  <Link
                    href={`/categoria/${slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 group-hover:gap-3 transition-all"
                  >
                    <span>Acessar editoria completa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
