import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, getBaseUrl } from '@/lib/site-config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ArrowLeft, Shield, Building, MapPin, Phone, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Portal News',
  description:
    'Conheça a Política de Privacidade do Portal News em conformidade com as diretrizes do Google AdSense e a Lei Geral de Proteção de Dados (LGPD).',
  alternates: {
    canonical: `${getBaseUrl()}/privacidade`,
  },
};

export default function PrivacidadePage() {
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

      {/* Conteúdo Institucional */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 flex-1">
        {/* Banner do Título */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Conformidade Legal &amp; Google AdSense</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Política de Privacidade
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Quadro com dados do responsável */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Identificação do Controlador e Responsável Legal
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

        {/* Artigos da Política */}
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">1. Compromisso com a Privacidade</h3>
            <p>
              O <strong>Portal News</strong> valoriza e respeita a privacidade de todos os seus leitores, usuários e parceiros. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações fornecidas e obtidas durante o acesso ao nosso portal de notícias, em estrita observância à Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 - LGPD) e às políticas para editores do Google AdSense.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">2. Google AdSense e Cookies de Publicidade (DoubleClick DART)</h3>
            <p>
              O Google, como fornecedor terceiro, utiliza cookies para veicular anúncios no <strong>Portal News</strong>. O uso do cookie DART pelo Google permite a veiculação de anúncios com base nas visitas que o usuário faz a este e a outros sites na Internet.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fornecedores terceiros, incluindo o Google, utilizam cookies para veicular anúncios com base em visitas anteriores do usuário ao nosso website ou a outros websites.</li>
              <li>Com o uso de cookies de publicidade, o Google e seus parceiros podem veicular anúncios personalizados para você com base nas suas visitas ao <strong>Portal News</strong> e/ou a outros sites na Internet.</li>
              <li>Os usuários podem desativar a publicidade personalizada acessando as <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-red-600 underline font-semibold">Configurações de Anúncios do Google</a>.</li>
              <li>Alternativamente, você pode desativar o uso de cookies de publicidade personalizada de terceiros acessando o website oficial da <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-red-600 underline font-semibold">www.aboutads.info</a>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">3. Informações Coletadas</h3>
            <p>
              Podemos coletar e processar os seguintes tipos de informações:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Dados fornecidos voluntariamente:</strong> Nome, endereço de e-mail e assunto quando você entra em contato com nossa equipe através da página de contato. Cada contato gera um protocolo oficial para rastreabilidade e segurança.</li>
              <li><strong>Dados de navegação e arquivos de log:</strong> Endereço IP, tipo de navegador, provedor de serviços de Internet (ISP), páginas de referência/saída, tipo de plataforma e registros de data/hora, utilizados exclusivamente para segurança e análise estatística agregada.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">4. Direitos do Titular de Dados (LGPD)</h3>
            <p>
              Nos termos do artigo 18 da LGPD, você tem o direito de solicitar a confirmação da existência de tratamento, o acesso aos seus dados pessoais, a correção de dados incompletos ou inexatos, e a eliminação de dados tratados com seu consentimento.
            </p>
            <p>
              Para exercer qualquer um destes direitos, basta acessar nossa página de <Link href="/contato" className="text-red-600 underline font-semibold">Contato</Link> ou enviar sua solicitação diretamente aos dados do responsável indicados nesta página.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">5. Segurança dos Dados</h3>
            <p>
              Empregamos protocolos de segurança robustos, incluindo tráfego criptografado via HTTPS (SSL/TLS), sanitização de dados e proteção de servidores, assegurando a inviolabilidade das comunicações e a proteção contra acessos não autorizados.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">6. Contato com o Encarregado de Proteção de Dados</h3>
            <p>
              Em caso de dúvidas, comentários ou requisições relativas a esta política, contate:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
              <p><strong>Responsável:</strong> {SITE_CONFIG.institutional.responsible}</p>
              <p><strong>Localidade:</strong> {SITE_CONFIG.institutional.address}</p>
              <p><strong>Telefone Oficial:</strong> {SITE_CONFIG.institutional.phone}</p>
              <p><strong>Central Eletrônica:</strong> <Link href="/contato" className="text-red-600 underline font-semibold">Página de Atendimento Oficial</Link></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
