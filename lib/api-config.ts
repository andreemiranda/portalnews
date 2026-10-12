export const NEWS_API_CONFIG = {
  baseUrl: process.env.NEWS_API_BASE_URL || 'https://api-news-media.netlify.app',
  fallbackUrl: process.env.NEWS_API_FALLBACK_URL || 'https://news-sources-api.vercel.app',
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
