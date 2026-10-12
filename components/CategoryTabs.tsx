'use client';

import React, { useState, useRef } from 'react';
import {
  Globe,
  TrendingUp,
  Landmark,
  Scale,
  GraduationCap,
  Trophy,
  Cpu,
  MapPin,
  Layers,
  Bookmark,
  Newspaper,
  LayoutGrid,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { ALL_CATEGORIES } from '@/lib/sources';

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  counts: Record<string, number>;
}

interface PopularCategoryItem {
  id: string;
  name: string;
  icon: any;
  highlight?: boolean;
}

export const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  { id: 'all', name: 'Todas as Notícias', icon: Layers },
  { id: 'Pará', name: 'Pará', icon: MapPin },
  { id: 'Notícias Gerais', name: 'Notícias Gerais', icon: Newspaper },
  { id: 'Economia', name: 'Economia', icon: TrendingUp },
  { id: 'Justiça', name: 'Justiça', icon: Scale },
  { id: 'Tocantins', name: 'Tocantins', icon: MapPin },
  { id: 'Educação', name: 'Educação', icon: GraduationCap },
  { id: 'Esporte', name: 'Esporte', icon: Trophy },
  { id: 'Tecnologia e Games', name: 'Tecnologia & Games', icon: Cpu },
  { id: 'Goiás', name: 'Goiás', icon: MapPin },
  { id: 'Santa Catarina', name: 'Santa Catarina', icon: MapPin },
  { id: 'Mundo', name: 'Mundo', icon: Globe },
  { id: 'favoritos', name: 'Minha Lista', icon: Bookmark },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  setActiveCategory,
  counts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'tema' | 'regiao' | 'especial'>('all');

  const filteredCategories = ALL_CATEGORIES.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || cat.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const isCustomActive =
    activeCategory !== 'all' &&
    activeCategory !== 'favoritos' &&
    !POPULAR_CATEGORIES.some((p) => p.id === activeCategory);

  return (
    <>
      <nav className="bg-zinc-100 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2 py-2">
            {/* Scroll Left Button */}
            <button
              onClick={() => handleScroll(-220)}
              className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-white hover:bg-red-600 hover:border-red-600 dark:hover:bg-red-600 dark:hover:border-red-600 transition shadow-xs shrink-0 flex items-center justify-center cursor-pointer group"
              title="Rolar menu para a esquerda"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Scrollable Container with RED Horizontal Scrollbar */}
            <div
              ref={scrollContainerRef}
              className="scrollbar-menu-red flex items-center gap-1.5 sm:gap-2 pb-2 pt-0.5 overflow-x-auto w-full"
            >
              {/* All 50 Categories Trigger Button */}
              <button
                id="open-all-categories-modal"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition whitespace-nowrap shrink-0 border bg-red-600 text-white border-red-600 shadow-sm hover:bg-red-700 active:bg-red-800 ring-2 ring-red-400/40"
                title="Ver todas as 50 editorias disponíveis"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>50 Editorias</span>
              </button>

              {/* If an editoria from the modal is active, display it as a selected pill */}
              {isCustomActive && (
                <button
                  id={`category-tab-${activeCategory}`}
                  onClick={() => setActiveCategory(activeCategory)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition whitespace-nowrap shrink-0 border bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-400/40 hover:bg-red-700"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{activeCategory}</span>
                  {counts[activeCategory] !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-white/25">
                      {counts[activeCategory]}
                    </span>
                  )}
                </button>
              )}

              {POPULAR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = counts[cat.id] ?? (cat.id === 'Pará' ? counts['para'] : undefined);

                return (
                  <button
                    key={cat.id}
                    id={`category-tab-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 border cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-400/40 hover:bg-red-700'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                    <span>{cat.name}</span>
                    {typeof count === 'number' && count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => handleScroll(220)}
              className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-white hover:bg-red-600 hover:border-red-600 dark:hover:bg-red-600 dark:hover:border-red-600 transition shadow-xs shrink-0 flex items-center justify-center cursor-pointer group"
              title="Rolar menu para a direita"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* 50 Categories Modal Selector */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600 text-white rounded-xl shadow-sm">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                    Todas as 50 Editorias & Fontes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Selecione qualquer editoria para carregar notícias
                  </p>
                </div>
              </div>
              <button
                id="close-all-categories-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Pesquisar entre as 50 editorias (ex: Tocantins, Economia, Santos, Caruaru)..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-zinc-100"
                  autoFocus
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Group quick filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  onClick={() => setSelectedGroup('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedGroup === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  Todas ({ALL_CATEGORIES.length})
                </button>
                <button
                  onClick={() => setSelectedGroup('tema')}
                  className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedGroup === 'tema'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  Temáticas (Economia, Justiça, Esportes...)
                </button>
                <button
                  onClick={() => setSelectedGroup('regiao')}
                  className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedGroup === 'regiao'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  Estados & Regiões
                </button>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {filteredCategories.map((cat) => {
                  const isCurrent = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setIsModalOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition group ${
                        isCurrent
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400 font-extrabold shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCurrent ? (
                          <Check className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600 group-hover:bg-red-500 transition shrink-0" />
                        )}
                        <span className="text-xs font-semibold truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {cat.count} fontes
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Nenhuma editoria encontrada para &quot;{searchFilter}&quot;.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>76 canais integrados via Upstream API</span>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setIsModalOpen(false);
                }}
                className="text-red-600 hover:underline font-bold"
              >
                Voltar para Todas as Notícias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
