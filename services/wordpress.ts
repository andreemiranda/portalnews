/**
 * Serviço de Integração Contínua com a API REST do WordPress
 * Métodos padronizados para consumo e revalidação de conteúdo com ISR de 60s
 */

import {
  getWordPressPosts,
  getWordPressPostBySlug,
  getWordPressCategories,
  getWordPressPages,
  getWordPressStats,
  WPPostParams,
  WPConnectionStatus,
} from '@/lib/wp';
import { NewsItem } from '@/lib/types';

export const WordPressService = {
  /**
   * Consulta matérias com ISR de 60 segundos
   */
  async getPosts(params: WPPostParams = {}): Promise<NewsItem[]> {
    return getWordPressPosts(params);
  },

  /**
   * Obtém matéria individual por slug ou ID
   */
  async getPostBySlug(slug: string): Promise<NewsItem | null> {
    return getWordPressPostBySlug(slug);
  },

  /**
   * Consulta arquivo de editorias e categorias
   */
  async getCategories(): Promise<any[]> {
    return getWordPressCategories();
  },

  /**
   * Consulta páginas institucionais e municipais
   */
  async getPages(): Promise<any[]> {
    return getWordPressPages();
  },

  /**
   * Monitoramento ao vivo da conexão com a API REST
   */
  async getStatus(): Promise<WPConnectionStatus> {
    return getWordPressStats();
  },
};

export default WordPressService;
