'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, ShieldCheck, Heart, Volume2, Globe, FileCode, ExternalLink } from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';
import { SITE_CONFIG } from '@/lib/site-config';

interface FooterProps {
  setActiveCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveCategory }) => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Localized Footer AdSense Slot */}
        <AdSenseBanner slot={SITE_CONFIG.adsense.slots.footer} format="horizontal" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
                P
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-serif tracking-tight">
                  PORTAL <span className="text-red-500">NEWS</span>
                </h3>
                <p className="text-xs text-zinc-500">Jornalismo e Cobertura Nacional Completa</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              Informação ágil, verificação contínua e cobertura jornalística abrangente sobre economia,
              justiça, educação, política, esportes, tecnologia e os estados brasileiros.
            </p>

            <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Redação Central • Brasil</span>
            </div>
          </div>

          {/* Categories Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider">Editorias em Destaque</h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'all', name: 'Todas as Notícias' },
                { id: 'Notícias Gerais', name: 'Notícias Gerais' },
                { id: 'Economia', name: 'Economia' },
                { id: 'Justiça', name: 'Justiça' },
                { id: 'Educação', name: 'Educação' },
                { id: 'Esporte', name: 'Esporte' },
                { id: 'Tecnologia e Games', name: 'Tecnologia & Games' },
                { id: 'Pará', name: 'Pará' },
                { id: 'Tocantins', name: 'Tocantins' },
                { id: 'Mundo', name: 'Mundo' },
              ].map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    className="hover:text-red-400 transition"
                  >
                    • {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards & Experience */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider">
              Recursos do Leitor
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Leitura em Áudio Sintetizado</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Modo Escuro e Sem Anúncios Intrusivos</span>
              </p>
              <p className="flex items-center gap-2">
                <Newspaper className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Feeds ao Vivo e Cobertura Contínua</span>
              </p>
            </div>
          </div>

          {/* Sitemaps Section */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-zinc-200 tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-red-400" />
              <span>Sitemaps &amp; Indexação</span>
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
            </ul>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Portal News. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition">
              Sitemaps XML
            </a>
          </div>
          <p className="flex items-center gap-1">
            <span>Desenvolvido com excelência jornalística e tecnologia</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
