/**
 * Configurações Centrais do Portal News
 * Domínio, URLs canônicas, AdSense, Dados Institucionais e SMTP
 */

export function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_DOMAIN ||
    process.env.APP_URL ||
    'https://portalnews-pi.vercel.app';

  let normalized = envUrl.trim();
  if (!normalized) {
    normalized = 'https://portalnews-pi.vercel.app';
  }
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/+$/, '');
}

export const SITE_CONFIG = {
  name: 'Portal News',
  shortName: 'Portal News',
  tagline: 'A informação que move o Brasil',
  description:
    'Portal de notícias com cobertura de política, economia, justiça, educação, esportes, tecnologia e notícias dos estados brasileiros.',
  institutional: {
    responsible: 'Portal News',
    address: 'Brasília-DF',
    phone: '(61) 9 9242-8022',
    email: 'contato@portalnews.com.br',
  },
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
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    receiver: process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER || 'contato@portalnews.com.br',
  },
  aiSummary: {
    endpoint: process.env.AI_SUMMARY_API_ENDPOINT || '',
    apiKey: process.env.AI_SUMMARY_API_KEY || '',
    model: process.env.AI_SUMMARY_MODEL || '',
  },
};
