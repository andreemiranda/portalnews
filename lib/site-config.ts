/**
 * Configurações Centrais do Portal News
 * Domínio, URLs canônicas, AdSense e Integrações
 */

export function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_DOMAIN ||
    process.env.APP_URL ||
    'https://ais-dev-qyzbaiotwmw74wkgcp56qo-771752383788.us-east1.run.app';

  let normalized = envUrl.trim();
  if (!normalized) {
    normalized = 'https://portalnews.com.br';
  }
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/+$/, '');
}

export const SITE_CONFIG = {
  name: 'Portal News',
  shortName: 'Portal News',
  tagline: 'Jornalismo • Brasil e Cobertura Completa',
  description:
    'Portal de notícias com cobertura de política, economia, justiça, educação, esportes, tecnologia e notícias dos estados brasileiros.',
  get domain(): string {
    return getBaseUrl();
  },
  adsense: {
    clientId:
      process.env.NEXT_PUBLIC_ADSENSE_ID ||
      process.env.GOOGLE_ADSENSE_CLIENT_ID ||
      process.env.VITE_GOOGLE_ADSENSE_CLIENT_ID ||
      '',
    slots: {
      header:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER ||
        process.env.GOOGLE_ADSENSE_SLOT_HEADER ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_HEADER ||
        '',
      sidebar:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ||
        process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR ||
        '',
      sidebarBottom:
        process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR_BOTTOM ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR_BOTTOM ||
        '',
      inArticle:
        process.env.GOOGLE_ADSENSE_SLOT_IN_ARTICLE ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_IN_ARTICLE ||
        '',
      footer:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ||
        process.env.GOOGLE_ADSENSE_SLOT_FOOTER ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_FOOTER ||
        '',
    },
  },
  aiSummary: {
    endpoint: process.env.AI_SUMMARY_API_ENDPOINT || '',
    apiKey: process.env.AI_SUMMARY_API_KEY || '',
    model: process.env.AI_SUMMARY_MODEL || '',
  },
};
