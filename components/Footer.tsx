'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode, ExternalLink, ArrowUp, Phone, MapPin, Building, Mail } from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';
import { SITE_CONFIG } from '@/lib/site-config';
import { categorySlugify } from '@/lib/slug';

interface FooterProps {
  setActiveCategory?: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveCategory }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 350);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Localized Footer AdSense Slot */}
        <AdSenseBanner slot={SITE_CONFIG.adsense.slots.footer} format="horizontal" />

        {/* Top Header of Footer - Logo & Tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              P
            </div>
            <div>
              <h3 className="text-base font-black text-white font-sans tracking-tight">
                PORTAL <span className="text-red-500">NEWS</span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">{SITE_CONFIG.tagline}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Info & Dados Institucionais */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              Cobertura jornalística independente, transparente e contínua sobre política, economia,
              justiça, educação, esportes, tecnologia e os estados brasileiros.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Building className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Responsável: {SITE_CONFIG.institutional.responsible}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Endereço: {SITE_CONFIG.institutional.address}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Telefone: {SITE_CONFIG.institutional.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <Link href="/contato" className="hover:text-red-400 transition underline underline-offset-2">
                  Contato
                </Link>
              </div>
            </div>
          </div>

          {/* Categories Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider">Editorias</h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'all', name: 'Todas as Notícias' },
                { id: 'Política', name: 'Política' },
                { id: 'Economia', name: 'Economia' },
                { id: 'Justiça', name: 'Justiça' },
                { id: 'Educação', name: 'Educação' },
                { id: 'Saúde', name: 'Saúde' },
                { id: 'Esporte', name: 'Esporte' },
                { id: 'Tecnologia e Games', name: 'Tecnologia & Games' },
                { id: 'Pará', name: 'Pará' },
                { id: 'Tocantins', name: 'Tocantins' },
              ].map((cat) => (
                <li key={cat.id}>
                  {setActiveCategory ? (
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className="hover:text-red-400 transition cursor-pointer text-left"
                    >
                      • {cat.name}
                    </button>
                  ) : (
                    <Link
                      href={cat.id === 'all' ? '/' : `/categoria/${categorySlugify(cat.id)}`}
                      className="hover:text-red-400 transition block"
                    >
                      • {cat.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Políticas e Conformidade Institucional */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider">
              Institucional &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pagina" className="hover:text-red-400 transition block">
                  • Páginas Institucionais
                </Link>
              </li>
              <li>
                <Link href="/categoria" className="hover:text-red-400 transition block">
                  • Todas as Editorias
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-red-400 transition block">
                  • TV &amp; Vídeos
                </Link>
              </li>
              <li>
                <Link href="/noticia" className="hover:text-red-400 transition block">
                  • Sala de Imprensa
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-red-400 transition block">
                  • Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-red-400 transition block">
                  • Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-red-400 transition block">
                  • Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-red-400 transition block font-bold text-red-400">
                  • Contato
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('portal_cookie_consent');
                      window.location.reload();
                    }
                  }}
                  className="text-zinc-500 hover:text-zinc-300 transition text-[11px] pt-1 cursor-pointer block text-left"
                >
                  • Preferências de Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Sitemaps & Monitoramento */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-red-400" />
              <span>Sitemaps &amp; Sincronização</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition flex items-center justify-between group"
                >
                  <span>• Sitemap Principal (Índice XML)</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap-posts.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition flex items-center justify-between group"
                >
                  <span>• Sitemap de Notícias / Posts</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap-categories.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition flex items-center justify-between group"
                >
                  <span>• Sitemap de Categorias</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap-images.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition flex items-center justify-between group"
                >
                  <span>• Sitemap de Imagens</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap-pages.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition flex items-center justify-between group"
                >
                  <span>• Sitemap de Páginas</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li className="pt-2 border-t border-zinc-900">
                <a
                  href="/api/sync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 text-zinc-400 transition flex items-center justify-between group font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Status da Conexão API
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom bar com espaçamento lateral à direita para o botão redondo flutuante */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4 pr-0 sm:pr-20">
          <p>© {new Date().getFullYear()} Portal News. Todos os direitos reservados. {SITE_CONFIG.institutional.address}.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
            <Link href="/privacidade" className="hover:text-zinc-300 transition">Privacidade</Link>
            <span>•</span>
            <Link href="/termos" className="hover:text-zinc-300 transition">Termos</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-zinc-300 transition">Cookies</Link>
            <span>•</span>
            <Link href="/contato" className="hover:text-zinc-300 transition">Contato</Link>
          </div>
          <p className="flex items-center gap-1 text-center md:text-left">
            <span>Portal News - Jornalismo e Informação</span>
          </p>
        </div>
      </div>

      {/* Botão Redondo Flutuante de Subir ao Topo */}
      {showScrollTop && (
        <button
          id="floating-scroll-top-button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ring-4 ring-white/30 dark:ring-zinc-900/60 cursor-pointer"
          title="Subir ao topo"
          aria-label="Subir ao topo"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
};
