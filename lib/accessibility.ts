/**
 * Gerenciador Global de Acessibilidade e Tema (Portal News)
 * 
 * Controla:
 * 1. Modo Escuro / Modo Claro com persistência em localStorage e classe 'dark' no <html>.
 * 2. Tamanho da Fonte (normal, large, xlarge) aplicando data-font-size no <html>.
 * 3. Eventos globais para sincronização instantânea entre todos os componentes.
 */

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

const THEME_STORAGE_KEY = 'portal_theme';
const FONT_SIZE_STORAGE_KEY = 'portal_font_size';

export function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function applyTheme(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
    window.dispatchEvent(new CustomEvent('portal_theme_change', { detail: { isDark } }));
  } catch {
    // ignore
  }
}

export function getInitialFontSize(): FontSizeOption {
  if (typeof window === 'undefined') return 'normal';
  try {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizeOption;
    if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
    const currentAttr = document.documentElement.getAttribute('data-font-size') as FontSizeOption;
    if (currentAttr === 'normal' || currentAttr === 'large' || currentAttr === 'xlarge') {
      return currentAttr;
    }
  } catch {
    // ignore
  }
  return 'normal';
}

export function applyFontSize(size: FontSizeOption): void {
  if (typeof window === 'undefined') return;
  try {
    document.documentElement.setAttribute('data-font-size', size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    window.dispatchEvent(new CustomEvent('portal_fontsize_change', { detail: { size } }));
  } catch {
    // ignore
  }
}
