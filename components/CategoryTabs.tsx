'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  TrendingUp,
  Scale,
  GraduationCap,
  Trophy,
  Cpu,
  MapPin,
  Layers,
  Bookmark,
  Newspaper,
  Flame,
  Landmark,
  HeartPulse,
  Palette,
} from 'lucide-react';

export interface CategoryTabsProps {
  activeCategory?: string;
  setActiveCategory?: (cat: string) => void;
  counts?: Record<string, number>;
}

export interface PopularCategoryItem {
  id: string;
  name: string;
  icon: any;
  highlight?: boolean;
}

export const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  { id: 'all', name: 'Todas as Notícias', icon: Layers },
  { id: 'Política', name: 'Política', icon: Landmark },
  { id: 'Economia', name: 'Economia', icon: TrendingUp },
  { id: 'Justiça', name: 'Justiça', icon: Scale },
  { id: 'Saúde', name: 'Saúde', icon: HeartPulse },
  { id: 'Educação', name: 'Educação', icon: GraduationCap },
  { id: 'Cultura', name: 'Cultura', icon: Palette },
  { id: 'Esporte', name: 'Esporte', icon: Trophy },
  { id: 'Tecnologia e Games', name: 'Tecnologia & Games', icon: Cpu },
  { id: 'Notícias Gerais', name: 'Gerais', icon: Newspaper },
  { id: 'Pará', name: 'Pará', icon: MapPin },
  { id: 'Tocantins', name: 'Tocantins', icon: MapPin },
  { id: 'Goiás', name: 'Goiás', icon: MapPin },
  { id: 'Santa Catarina', name: 'Santa Catarina', icon: MapPin },
  { id: 'Mundo', name: 'Mundo', icon: Globe },
  { id: 'favoritos', name: 'Minha Lista', icon: Bookmark },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory = 'all',
  setActiveCategory,
}) => {
  const router = useRouter();

  const handleCategoryClick = (catId: string) => {
    if (setActiveCategory) {
      setActiveCategory(catId);
    } else {
      router.push(catId === 'all' ? '/' : `/?category=${encodeURIComponent(catId)}`);
    }
  };

  const currentCategory = activeCategory || 'all';
  const isCustomActive =
    currentCategory !== 'all' &&
    currentCategory !== 'favoritos' &&
    currentCategory !== '' &&
    !POPULAR_CATEGORIES.some((p) => p.id.toLowerCase() === currentCategory.toLowerCase());

  return (
    <nav
      id="portal-categories-menu"
      className="bg-zinc-100 dark:bg-zinc-900/95 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 backdrop-blur-md transition-colors shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        {/* Menu fixo e em linha (com quebra natural em mais de uma linha se necessário) sem carrossel, sem setas e sem números */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Se uma editoria personalizada estiver ativa, exibe o botão em destaque */}
          {isCustomActive && (
            <button
              id={`category-tab-${currentCategory}`}
              onClick={() => handleCategoryClick(currentCategory)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-400/40 hover:bg-red-700 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{currentCategory}</span>
            </button>
          )}

          {POPULAR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              currentCategory.toLowerCase() === cat.id.toLowerCase() ||
              (cat.id === 'Pará' && currentCategory.toLowerCase() === 'para');

            return (
              <button
                key={cat.id}
                id={`category-tab-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-400/40 hover:bg-red-700'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
