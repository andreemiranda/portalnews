'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Shield, Check, X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'portal_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        // Exibe o banner suavemente após o carregamento inicial
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        essential: true,
        analytics: true,
        advertising: true,
        timestamp: new Date().toISOString(),
      }));
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        essential: true,
        analytics: false,
        advertising: false,
        timestamp: new Date().toISOString(),
      }));
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Aviso de Privacidade e Cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-500"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="p-2 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-xl shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Privacidade e Uso de Cookies no Portal News
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Utilizamos cookies e tecnologias similares para personalizar conteúdo, fornecer recursos de redes sociais e veicular anúncios relevantes de acordo com as diretrizes do Google AdSense e a Lei Geral de Proteção de Dados (LGPD). Ao clicar em &quot;Aceitar Todos&quot;, você concorda com a nossa{' '}
              <Link href="/privacidade" className="text-red-600 dark:text-red-400 underline font-semibold hover:text-red-700">
                Política de Privacidade
              </Link>{' '}
              e{' '}
              <Link href="/cookies" className="text-red-600 dark:text-red-400 underline font-semibold hover:text-red-700">
                Política de Cookies
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end flex-wrap sm:flex-nowrap">
          <button
            id="cookie-consent-essential"
            onClick={handleAcceptEssential}
            className="w-full sm:w-auto px-4 py-2 rounded-full border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
          >
            Apenas Essenciais
          </button>
          <button
            id="cookie-consent-accept-all"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aceitar Todos</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
