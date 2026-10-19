'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import {
  ArrowLeft,
  Mail,
  Send,
  Building,
  MapPin,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ContatoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Sugestão de Pauta');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    protocol: string;
    formattedProtocol: string;
    instruction: string;
  } | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage('Por favor, escreva uma mensagem detalhada com pelo menos 10 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao enviar a mensagem. Tente novamente.');
      }

      setSuccessData({
        protocol: data.protocol,
        formattedProtocol: data.formattedProtocol,
        instruction: data.instruction || 'Por favor, anote este número de protocolo para seu acompanhamento e controle.',
      });

      // Limpa os campos do formulário
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na conexão com o servidor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyProtocol = () => {
    if (successData && typeof window !== 'undefined') {
      navigator.clipboard.writeText(successData.protocol);
      setCopiedProtocol(true);
      setTimeout(() => setCopiedProtocol(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between transition-colors">
      {/* Header Institucional */}
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

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 flex-1 w-full">
        {/* Banner do Título */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-extrabold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>Atendimento ao Leitor</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
            Contato
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Envie sua mensagem, sugestão de pauta, esclarecimento ou correção editorial. Todas as comunicações recebem um número de protocolo oficial de 13 dígitos para controle e rastreabilidade.
          </p>
        </div>

        {/* Informações Institucionais Obrigatórias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Responsável</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
              {SITE_CONFIG.institutional.responsible}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Veículo de Comunicação e Notícias</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Endereço</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
              {SITE_CONFIG.institutional.address}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Sede Administrativa</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>Telefone</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
              {SITE_CONFIG.institutional.phone}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Atendimento Geral</p>
          </div>
        </div>

        {/* Modal/Box de Sucesso com Protocolo de 13 dígitos sem zero */}
        {successData && (
          <div
            id="contact-protocol-box"
            className="p-6 sm:p-8 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 space-y-5 shadow-lg animate-in zoom-in-95 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black">
                  Mensagem Registrada com Sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                  Sua solicitação foi encaminhada para nossa redação e administração.
                </p>
              </div>
            </div>

            {/* Protocolo em destaque */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-2xl shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  Protocolo Oficial de Atendimento (13 Dígitos)
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                  Válido
                </span>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-slate-900 dark:text-zinc-50">
                    {successData.formattedProtocol}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Código sem separadores: {successData.protocol}
                  </p>
                </div>

                <button
                  onClick={handleCopyProtocol}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {copiedProtocol ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedProtocol ? 'Protocolo Copiado!' : 'Copiar Protocolo'}</span>
                </button>
              </div>

              {/* Solicitação obrigatória ao usuário */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>IMPORTANTE:</strong> {successData.instruction} Guarde este número para qualquer consulta ou verificação futura.
                </span>
              </div>
            </div>

            <button
              onClick={() => setSuccessData(null)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800"
            >
              Enviar outra mensagem
            </button>
          </div>
        )}

        {/* Formulário de Contato */}
        {!successData && (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6"
          >
            <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Formulário de Mensagem Direta
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Preencha os campos abaixo. Ao enviar, um número de protocolo de 13 dígitos será gerado imediatamente.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Nome Completo *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  E-mail para Retorno *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Assunto do Atendimento *
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="Sugestão de Pauta">Sugestão de Pauta / Reportagem</option>
                <option value="Correção Editorial">Correção ou Atualização de Notícia</option>
                <option value="Comercial e Anúncios">Comercial e Parcerias</option>
                <option value="Privacidade e Dados">Privacidade e Dados Pessoais (LGPD)</option>
                <option value="Elogio ou Crítica">Elogio, Crítica ou Dúvida Geral</option>
                <option value="Outro">Outro Assunto</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Mensagem Detalhada *
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem com clareza e informações pertinentes..."
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Ao enviar, você receberá um protocolo numerado oficial para acompanhamento.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gerando Protocolo...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensagem</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
