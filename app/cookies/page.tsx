import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, getBaseUrl } from '@/lib/site-config';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ArrowLeft, Cookie, Building, MapPin, Phone, CheckCircle2, RotateCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Cookies | Portal News',
  description:
    'Entenda como o Portal News utiliza cookies e tecnologias de rastreamento para aprimorar sua experiência e veicular anúncios do Google AdSense.',
  alternates: {
    canonical: `${getBaseUrl()}/cookies`,
  },
};

export default function CookiesPage() {
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

      {/* Conteúdo de Cookies */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 flex-1">
        {/* Banner do Título */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparência Digital</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Política de Cookies
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Conheça os tipos de cookies que utilizamos e como você pode gerenciar suas preferências.
          </p>
        </div>

        {/* Quadro Institucional */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Dados de Identificação
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

        {/* Detalhamento de Cookies */}
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">1. O que são Cookies?</h3>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu computador, tablet ou smartphone quando você visita páginas na web. Eles permitem que o portal memorize suas preferências de navegação (como tamanho de fonte e modo de visualização claro/escuro) e auxiliam na entrega de publicidade segura e relevante.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">2. Categorias de Cookies Utilizados</h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mb-1">A. Cookies Estritamente Necessários</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Essenciais para o funcionamento básico do site, segurança das conexões HTTPS, carregamento rápido das notícias e gravação das escolhas de acessibilidade (modo de cor e tamanho da fonte).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mb-1">B. Cookies de Publicidade e Google AdSense</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Utilizados pelo Google e fornecedores autorizados para veicular anúncios não intrusivos que financiam a produção jornalística do <strong>Portal News</strong>. Esses cookies ajudam a limitar a quantidade de vezes que você vê um mesmo anúncio e avaliam a eficácia das campanhas veiculadas.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mb-1">C. Cookies de Desempenho e Estatística</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Coletam métricas anônimas e agregadas de navegação para que nossos jornalistas compreendam quais matérias e editorias despertam maior interesse no público.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">3. Como Gerenciar ou Desativar Cookies no Navegador</h3>
            <p>
              Você pode, a qualquer momento, alterar as configurações do seu navegador para bloquear ou alertá-lo sobre o uso de cookies:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Google Chrome:</strong> Configurações &gt; Privacidade e segurança &gt; Cookies e outros dados do site.</li>
              <li><strong>Mozilla Firefox:</strong> Opções &gt; Privacidade e Segurança &gt; Cookies e dados de sites.</li>
              <li><strong>Apple Safari:</strong> Preferências &gt; Privacidade &gt; Bloquear todos os cookies.</li>
              <li><strong>Microsoft Edge:</strong> Configurações &gt; Permissões do site &gt; Cookies e dados armazenados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">4. Dúvidas e Atendimento</h3>
            <p>
              Caso deseje esclarecer qualquer aspecto desta política, visite nossa página de <Link href="/contato" className="text-red-600 underline font-semibold">Contato</Link> ou utilize os canais oficiais do responsável listados nesta página.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
