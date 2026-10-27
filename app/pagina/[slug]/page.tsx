import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
  ArrowLeft,
  BookOpen,
  Mail,
  Scale,
  Cookie,
  Building,
  Phone,
  CheckCircle,
} from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface InstitutionalContent {
  title: string;
  category: string;
  icon: any;
  lead: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}

const PAGES_DATABASE: Record<string, InstitutionalContent> = {
  sobre: {
    title: 'Sobre o Portal News',
    category: 'Institucional',
    icon: Info,
    lead: 'O Portal News é um veículo de comunicação digital independente, dedicado à cobertura em tempo real dos principais acontecimentos políticos, econômicos, jurídicos e sociais do Brasil.',
    sections: [
      {
        heading: 'Missão e Vocação Pública',
        paragraphs: [
          'Nossa missão fundamental é oferecer jornalismo ágil, independente e fundamentado na checagem rigorosa dos fatos. Em um ecossistema digital dinâmico, priorizamos a precisão da informação, o pluralismo de ideias e a contextualização aprofundada dos acontecimentos que impactam o cidadão.',
          'Com redação estruturada e correspondentes atentos às particularidades regionais do país, o portal conecta leitores às notícias do Congresso Nacional, tribunais superiores, mercados produtivos e acontecimentos estaduais.',
        ],
      },
      {
        heading: 'Compromisso com a Verdade e Pluralidade',
        paragraphs: [
          'A apuração dos fatos é conduzida com distanciamento crítico, ouvindo todas as partes envolvidas e assegurando amplo direito de resposta sempre que necessário. Repudiamos a disseminação de informações inverídicas, boatos ou manchetes sensacionalistas.',
          'Nossos colunistas e repórteres operam sob princípios deontológicos universais do jornalismo, assegurando que o leitor receba análises embasadas e transparentes.',
        ],
      },
      {
        heading: 'Estrutura e Dados Institucionais',
        paragraphs: [
          `Veículo de imprensa operado sob a responsabilidade editorial de ${SITE_CONFIG.institutional.responsible}, sediado em ${SITE_CONFIG.institutional.address}.`,
          `Canais oficiais de atendimento: ${SITE_CONFIG.institutional.email} e telefone ${SITE_CONFIG.institutional.phone}.`,
        ],
      },
    ],
  },
  'linha-editorial': {
    title: 'Linha Editorial e Princípios Éticos',
    category: 'Jornalismo',
    icon: BookOpen,
    lead: 'Conheça os pilares éticos e operacionais que orientam diariamente a apuração, redação e publicação de conteúdos no Portal News.',
    sections: [
      {
        heading: '1. Verificação Rigorosa e Fontes Identificadas',
        paragraphs: [
          'Toda informação publicada passa por processo de checagem cruzada junto a fontes oficiais, bases de dados públicas e relatórios técnicos. Sempre que possível, os documentos e links originais são disponibilizados ao leitor.',
          'O uso de fontes anônimas é reservado estritamente a situações excepcionais onde a segurança física ou profissional do informante esteja sob risco comprovado.',
        ],
      },
      {
        heading: '2. Correções e Direito de Resposta',
        paragraphs: [
          'Erros factuais cometidos em nossas reportagens são corrigidos com máxima celeridade. As notas de correção e atualização são mantidas de forma transparente no topo ou rodapé do próprio artigo.',
          'Pessoas físicas, entidades ou empresas citadas de forma crítica têm garantido o espaço e o tempo hábil para manifestação prévia à publicação ou réplica equivalente.',
        ],
      },
      {
        heading: '3. Independência Publicitária',
        paragraphs: [
          'A produção editorial é rigorosamente independente da área comercial e de anunciantes. Conteúdos patrocinados ou de parcerias comerciais são identificados com clareza visual inequívoca como informe publicitário.',
        ],
      },
    ],
  },
  transparencia: {
    title: 'Transparência e Governança',
    category: 'Institucional',
    icon: Eye,
    lead: 'Compromisso permanente com a prestação de contas, governança corporativa e integridade da informação pública.',
    sections: [
      {
        heading: 'Identificação e Responsabilidade',
        paragraphs: [
          `O Portal News atua em conformidade com as leis federais de imprensa, a Constituição Federal de 1988 e o Marco Civil da Internet (Lei 12.965/2014).`,
          `Responsável Editorial: ${SITE_CONFIG.institutional.responsible}. Sede operacional: ${SITE_CONFIG.institutional.address}.`,
        ],
      },
      {
        heading: 'Rastreabilidade Editorial',
        paragraphs: [
          'Todas as matérias jornalísticas exibem data e horário de publicação, indicação de autoria ou agência responsável, além de histórico de eventuais revisões de texto.',
          'O leitor pode acompanhar a integridade de nossas publicações através dos sitemaps oficiais e ferramentas de auditoria disponíveis em nosso portal.',
        ],
      },
    ],
  },
  ouvidoria: {
    title: 'Ouvidoria e Atendimento ao Leitor',
    category: 'Atendimento',
    icon: HelpCircle,
    lead: 'Espaço aberto para o leitor manifestar dúvidas, sugestões de pauta, correções editoriais e reclamações.',
    sections: [
      {
        heading: 'Como Funciona a Ouvidoria',
        paragraphs: [
          'A Ouvidoria do Portal News atua com autonomia para receber, encaminhar e responder às manifestações do público leitor no prazo de até 48 horas úteis.',
          'Todas as comunicações recebem um número de protocolo para acompanhamento do processo de análise pela editoria responsável.',
        ],
      },
      {
        heading: 'Canais de Contato',
        paragraphs: [
          `E-mail exclusivo: ${SITE_CONFIG.institutional.email}`,
          `Telefone de atendimento: ${SITE_CONFIG.institutional.phone}`,
          `Para envio de mensagens via formulário integrado, acesse a nossa página oficial de Contato.`,
        ],
      },
    ],
  },
  'cadastro-certo': {
    title: 'Cadastro Certo e Boletim de Notícias',
    category: 'Serviços',
    icon: CheckCircle,
    lead: 'Receba gratuitamente as principais manchetes, resumos matinais e alertas urgentes diretamente no seu e-mail.',
    sections: [
      {
        heading: 'Segurança e Praticidade',
        paragraphs: [
          'Ao se cadastrar na lista de novidades do Portal News, você recebe uma seleção das notícias mais relevantes do país sem excesso de mensagens e com total respeito à sua privacidade.',
          'Seus dados cadastrais jamais são compartilhados com terceiros e você pode cancelar sua inscrição a qualquer momento com apenas um clique.',
        ],
      },
    ],
  },
  'sobre-a-prefeitura': {
    title: 'Sobre a Prefeitura e Administração Municipal',
    category: 'Institucional',
    icon: Building,
    lead: 'Informações institucionais sobre os órgãos públicos municipais, serviços essenciais e canais de relacionamento com o cidadão.',
    sections: [
      {
        heading: 'Estrutura Administrativa e Competências',
        paragraphs: [
          'Acompanhe as diretrizes das secretarias municipais, atos do poder executivo, decretos normativos e comunicados oficiais aos munícipes.',
          'Nossa cobertura jornalística assegura a prestação de serviços com transparência, acompanhando as políticas públicas e o impacto no cotidiano da população.',
        ],
      },
      {
        heading: 'Atendimento ao Cidadão',
        paragraphs: [
          `Consulte as unidades presenciais e os canais de protocolo digital para requerimentos, certidões e agendamentos.`,
          `Para atendimento institucional, envie sua mensagem através da nossa Ouvidoria ou utilize o formulário na página de Contato.`,
        ],
      },
    ],
  },
  iptu: {
    title: 'IPTU - Consulta de Débitos e Serviços Fazendários',
    category: 'Serviços',
    icon: FileText,
    lead: 'Orientações oficiais sobre emissão de guias do IPTU, parcelamento de débitos, certidões negativas e prazos do calendário fiscal.',
    sections: [
      {
        heading: 'Emissão de 2ª Via e Pagamento com Desconto',
        paragraphs: [
          'O contribuinte pode emitir a 2ª via da cota única ou dos boletos parcelados informando o número de inscrição imobiliária do imóvel ou o CPF do proprietário.',
          'O pagamento em cota única até a data de vencimento concede descontos estabelecidos na legislação tributária municipal vigente.',
        ],
      },
      {
        heading: 'Isenções e Certidões Tributárias',
        paragraphs: [
          'Aposentados, pensionistas e beneficiários que atendam aos requisitos previstos na lei tributária municipal podem protocolar pedido de isenção de IPTU dentro dos prazos estipulados.',
          'Certidões negativas de débitos imobiliários podem ser emitidas online mediante validação de autenticidade eletrônica.',
        ],
      },
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES_DATABASE[slug];
  const domain = getBaseUrl();
  const canonicalUrl = `${domain}/pagina/${encodeURIComponent(slug)}`;

  if (!page) {
    return {
      title: `Página Institucional | ${SITE_CONFIG.name}`,
      description: SITE_CONFIG.description,
    };
  }

  return {
    title: `${page.title} | ${SITE_CONFIG.name}`,
    description: page.lead,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${page.title} • ${SITE_CONFIG.name}`,
      description: page.lead,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} • ${SITE_CONFIG.name}`,
      description: page.lead,
    },
  };
}

export default async function PaginaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = PAGES_DATABASE[slug];
  const domain = getBaseUrl();

  // Se for uma página de redirecionamento para rotas nativas específicas
  if (slug === 'privacidade' || slug === 'termos' || slug === 'cookies' || slug === 'contato') {
    // Renderiza link direto ou conteúdo integrado
  }

  const pageData = page || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    category: 'Institucional',
    icon: FileText,
    lead: `Informações institucionais e diretrizes do ${SITE_CONFIG.name}.`,
    sections: [
      {
        heading: 'Apresentação Institucional',
        paragraphs: [
          `Esta página integra o conjunto de documentações e serviços de transparência do ${SITE_CONFIG.name}.`,
          `Para dúvidas ou esclarecimentos adicionais, entre em contato através de ${SITE_CONFIG.institutional.email}.`,
        ],
      },
    ],
  };

  const Icon = pageData.icon;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageData.title,
    url: `${domain}/pagina/${encodeURIComponent(slug)}`,
    description: pageData.lead,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      url: domain,
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/pagina" className="hover:text-red-600 dark:hover:text-red-400 transition">
            Institucional
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{pageData.title}</span>
        </nav>

        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Icon className="w-3.5 h-3.5" />
            <span>{pageData.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            {pageData.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
            {pageData.lead}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-8">
          {pageData.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-sans">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed text-justify">
                  {p}
                </p>
              ))}
            </div>
          ))}

          {/* Dados de Contato e Ouvidoria Integrados */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-200 font-bold">
              <Building className="w-4 h-4 text-red-600" />
              <span>{SITE_CONFIG.name} — {SITE_CONFIG.institutional.responsible}</span>
            </div>
            <p>Endereço: {SITE_CONFIG.institutional.address} • Telefone: {SITE_CONFIG.institutional.phone}</p>
            <p>Atendimento editorial e ouvidoria: <a href={`mailto:${SITE_CONFIG.institutional.email}`} className="text-red-600 dark:text-red-400 font-semibold underline">{SITE_CONFIG.institutional.email}</a></p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <Link
              href="/pagina"
              className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao índice institucional</span>
            </Link>
            <Link
              href="/contato"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
            >
              Falar com a Ouvidoria
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
