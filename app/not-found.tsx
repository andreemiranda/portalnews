import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site-config';
import {
  Newspaper,
  ArrowLeft,
  Search,
  Compass,
  TrendingUp,
  Scale,
  GraduationCap,
  Trophy,
  MapPin,
  Home,
} from 'lucide-react';

export default function NotFound() {
  const quickCategories = [
    { name: 'Todas as Notícias', href: '/', icon: Home },
    { name: 'Economia', href: '/?category=Economia', icon: TrendingUp },
    { name: 'Justiça', href: '/?category=Justi%C3%A7a', icon: Scale },
    { name: 'Educação', href: '/?category=Educa%C3%A7%C3%A3o', icon: GraduationCap },
    { name: 'Esporte', href: '/?category=Esporte', icon: Trophy },
    { name: 'Pará', href: '/?category=Par%C3%A1', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between transition-colors">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-red-400">
              <Compass className="w-3.5 h-3.5" />
              Edição Nacional
            </span>
            <span className="text-zinc-400 text-[11px]">Erro 404 • Conteúdo Não Localizado</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-zinc-100 font-sans">
                PORTAL <span className="text-red-600">NEWS</span>
              </h1>
              <p className="text-[11px] text-slate-400">{SITE_CONFIG.tagline}</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Página Inicial</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Error Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 flex-1 flex flex-col justify-center">
        {/* Error Badge & Icon */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-900/60 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Newspaper className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
            Erro 404 • Não Encontrado
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-zinc-50 tracking-tight font-sans">
            Página ou Notícia Não Encontrada
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            O conteúdo que você tentou acessar não está disponível. Ele pode ter sido renomeado, removido pela fonte original ou o endereço digitado contém erros.
          </p>
        </div>

        {/* Quick Search Form */}
        <div className="max-w-md mx-auto w-full">
          <form
            action="/"
            method="GET"
            className="relative flex items-center shadow-xs"
          >
            <Search className="w-4 h-4 absolute left-4 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Buscar matérias ou assuntos..."
              className="w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Quick Category Navigation Shortcuts */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ou navegue pelas principais editorias:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-red-500 hover:text-red-600 transition text-xs font-semibold shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-red-600" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-full transition shadow-md hover:shadow-lg hover:scale-105 transform cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>
      </main>

      {/* Clean Footer Bar */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-6 text-center text-xs text-slate-400 dark:text-zinc-400 bg-white dark:bg-zinc-900">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
