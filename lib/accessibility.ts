/**
 * Gerenciador Global de Acessibilidade e Tema (Portal News)
 * 
 * Regra: O Modo Claro é sempre a primeira opção e padrão obrigatório
 * ao abrir o site.
 */

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

const THEME_SESSION_KEY = 'portal_theme_session';
const FONT_SIZE_STORAGE_KEY = 'portal_font_size';

/**
 * Retorna o tema inicial do portal.
 * Sempre retorna false (Modo Claro) por padrão ao abrir o portal.
 */
export function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sessionTheme = sessionStorage.getItem(THEME_SESSION_KEY);
    if (sessionTheme === 'dark') return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Aplica o tema visual no HTML, sincronizando a classe dark e colorScheme.
 */
export function applyTheme(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      sessionStorage.setItem(THEME_SESSION_KEY, 'dark');
      localStorage.setItem('portal_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      sessionStorage.setItem(THEME_SESSION_KEY, 'light');
      localStorage.setItem('portal_theme', 'light');
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
