import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, getBaseUrl } from '@/lib/site-config';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ArrowLeft, FileText, Building, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso | Portal News',
  description:
    'Termos e condições gerais de uso dos serviços editoriais e informativos do Portal News.',
  alternates: {
    canonical: `${getBaseUrl()}/termos`,
  },
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between transition-colors">
      {/* Header institucional */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-zinc-100 font-sans">
                PORTAL <span className="text-red-600">NEWS</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{SITE_CONFIG.tagline}</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </header>

      {/* Menu Superior em Linha */}
      <CategoryTabs activeCategory="" />

      {/* Conteúdo dos Termos */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 flex-1">
        {/* Banner do Título */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Condições Gerais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Termos de Uso
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Vigência a partir de: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Quadro com dados do responsável */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Informações do Mantenedor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-red-600 shrink-0" />
              <span><strong>Responsável:</strong> {SITE_CONFIG.institutional.responsible}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <span><strong>Endereço:</strong> {SITE_CONFIG.institutional.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-600 shrink-0" />
              <span><strong>Telefone:</strong> {SITE_CONFIG.institutional.phone}</span>
            </div>
          </div>
        </div>

        {/* Artigos dos Termos de Uso */}
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">1. Aceitação dos Termos</h3>
            <p>
              Ao navegar, acessar ou utilizar o <strong>Portal News</strong>, o usuário declara ter lido, compreendido e aceitado plenamente todas as condições estipuladas nestes Termos de Uso. Caso não concorde com qualquer dos termos aqui estabelecidos, solicitamos a gentileza de descontinuar a navegação.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">2. Finalidade Editorial e Conteúdo</h3>
            <p>
              O <strong>Portal News</strong> tem por objeto a produção, apuração e divulgação de notícias, reportagens, artigos de opinião e informações de interesse público sobre economia, política, justiça, educação, esportes, tecnologia e as diversas regiões do Brasil.
            </p>
            <p>
              Empregamos esforços contínuos para manter as informações acuradas e atualizadas. Contudo, as matérias jornalísticas refletem o estado dos fatos no momento de sua veiculação.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">3. Propriedade Intelectual</h3>
            <p>
              Todos os textos, manchetes, títulos, logomarcas, identidade visual, marcas registradas e materiais gráficos presentes no <strong>Portal News</strong> são protegidos pela legislação de direitos autorais (Lei Federal nº 9.610/1998) e propriedade industrial.
            </p>
            <p>
              A citação de trechos de notícias é autorizada, desde que acompanhada do devido crédito ao <strong>Portal News</strong> e com inserção de hiperlink direto para a matéria original correspondente.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">4. Publicidade e Anúncios de Terceiros</h3>
            <p>
              O portal veicula espaços publicitários através do programa Google AdSense e redes parceiras. Os anunciantes são os únicos e exclusivos responsáveis pelo conteúdo de seus anúncios e pelas ofertas veiculadas, cabendo ao usuário a verificação da idoneidade antes de realizar qualquer transação com terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">5. Atendimento ao Leitor e Protocolo</h3>
            <p>
              Disponibilizamos canal direto para solicitação de correções, sugestões de pauta e direito de resposta na nossa página de <Link href="/contato" className="text-red-600 underline font-semibold">Contato</Link>. Toda comunicação recebe um protocolo numerado de 13 dígitos para acompanhamento transparente.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">6. Foro Aplicável</h3>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias decorrentes do uso do portal, fica eleito o Foro da Comarca de <strong>Brasília-DF</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
