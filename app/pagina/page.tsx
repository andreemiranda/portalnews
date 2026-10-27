import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site-config';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import {
  FileText,
  Shield,
  HelpCircle,
  Eye,
  Info,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Mail,
  Scale,
  Cookie,
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/pagina`;

  return {
    title: `Páginas Institucionais e Transparência | ${SITE_CONFIG.name}`,
    description:
      'Índice de páginas institucionais, transparência, ouvidoria, política editorial e termos de uso do Portal News.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Páginas Institucionais | ${SITE_CONFIG.name}`,
      description: SITE_CONFIG.description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
    },
  };
}

const INSTITUTIONAL_PAGES = [
  {
    slug: 'cadastro-certo',
    title: 'Cadastro Certo e Alertas',
    icon: Shield,
    category: 'Serviços',
    description: 'Receba gratuitamente as principais manchetes, resumos matinais e alertas urgentes diretamente no seu e-mail.',
  },
  {
    slug: 'sobre-a-prefeitura',
    title: 'Sobre a Prefeitura e Administração',
    icon: Info,
    category: 'Institucional',
    description: 'Estrutura administrativa, competências institucionais, secretarias e diretrizes de atendimento ao cidadão.',
  },
  {
    slug: 'transparencia',
    title: 'Transparência e Governança',
    icon: Eye,
    category: 'Institucional',
    description: 'Prestação de contas, dados corporativos, relatórios fiscais e responsabilidade editorial com acesso público.',
  },
  {
    slug: 'ouvidoria',
    title: 'Ouvidoria Geral e Atendimento',
    icon: HelpCircle,
    category: 'Atendimento',
    description: 'Canal direto para solicitações, sugestões de pauta, correções editoriais e dúvidas com protocolo oficial.',
  },
  {
    slug: 'iptu',
    title: 'IPTU e Serviços Fazendários',
    icon: FileText,
    category: 'Serviços',
    description: 'Consulta de débitos, emissão de 2ª via de boletos, certidões negativas e orientações sobre isenções fiscais.',
  },
  {
    slug: 'sobre',
    title: 'Sobre o Portal News',
    icon: Info,
    category: 'Institucional',
    description: 'Conheça a história, missão jornalística e o compromisso ético do Portal News com a informação independente no Brasil.',
  },
  {
    slug: 'linha-editorial',
    title: 'Linha Editorial e Princípios',
    icon: BookOpen,
    category: 'Jornalismo',
    description: 'Diretrizes éticas de apuração, verificação de fatos, direito de resposta e independência da nossa redação.',
  },
  {
    slug: 'contato',
    title: 'Contato da Redação e Atendimento',
    icon: Mail,
    category: 'Atendimento',
    description: 'Endereço, telefone, e-mails editoriais e formulário direto para contato com a equipe jornalística e comercial.',
  },
  {
    slug: 'privacidade',
    title: 'Política de Privacidade (LGPD)',
    icon: Shield,
    category: 'Jurídico',
    description: 'Tratamento seguro de dados pessoais em estrita conformidade com a Lei Federal nº 13.709/2018 e diretrizes internacionais.',
  },
  {
    slug: 'termos',
    title: 'Termos e Condições de Uso',
    icon: Scale,
    category: 'Jurídico',
    description: 'Regras de navegação, direitos autorais sobre reportagens e fotografias, propriedade intelectual e responsabilidades.',
  },
  {
    slug: 'cookies',
    title: 'Política e Gestão de Cookies',
    icon: Cookie,
    category: 'Jurídico',
    description: 'Informações detalhadas sobre cookies estritamente necessários, analíticos e de preferências de navegação.',
  },
];

export default function PaginasIndexPage() {
  const domain = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Páginas Institucionais e Transparência',
    url: `${domain}/pagina`,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: INSTITUTIONAL_PAGES.map((page, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: page.title,
        url: `${domain}/pagina/${page.slug}`,
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Páginas Institucionais</span>
        </nav>

        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Documentação Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Páginas Institucionais e Transparência
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Consulte todas as diretrizes editoriais, termos legais, canais de ouvidoria e informações
            corporativas do Portal News.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {INSTITUTIONAL_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.slug}
                href={`/pagina/${page.slug}`}
                className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-bold">
                      {page.category}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {page.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                      {page.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                  <span>Acessar documento</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
