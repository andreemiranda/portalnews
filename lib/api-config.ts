/**
 * Configuração dos Endpoints da API REST de Notícias
 * Prioriza o endpoint estável e de alta velocidade do Vercel com fallback automático
 */

const rawBase = process.env.NEWS_API_BASE_URL?.trim() || '';
const rawFallback = process.env.NEWS_API_FALLBACK_URL?.trim() || '';

// Se a base configurada for Netlify (que excede cota e retorna 503), prioriza o endpoint estável do Vercel
const isNetlifyBase = rawBase.includes('netlify');
const primaryUrl = isNetlifyBase
  ? (rawFallback || 'https://news-sources-api.vercel.app')
  : (rawBase || 'https://news-sources-api.vercel.app');

const fallbackUrl = isNetlifyBase
  ? (rawBase || 'https://api-news-media.netlify.app')
  : (rawFallback || 'https://api-news-media.netlify.app');

export const NEWS_API_CONFIG = {
  baseUrl: primaryUrl,
  fallbackUrl: fallbackUrl,
  apiKey: process.env.NEWS_API_KEY || 'bn_88feb5baa3f84955677e8c11453aae352811b9fe6c3398cd',
  endpoints: {
    listAllSources: '/api/news',
    categoryByName: (cat: string) => `/api/news/category/${encodeURIComponent(cat)}`,
    listAllImages: '/api/images',
    categories: '/api/categories',
    types: '/api/types',
    stats: '/api/stats',
    openapiSpec: '/api/openapi.json',
    sourceById: (id: string | number) => `/api/news/${id}`,
    imagesById: (id: string | number) => `/api/images/${id}`,
  },
};
