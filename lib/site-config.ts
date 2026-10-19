/**
 * Configurações Centrais do Portal News
 * Domínio, URLs canônicas, AdSense, Dados Institucionais e SMTP
 */

export function getBaseUrl(req?: Request): string {
  // 1. Prioridade absoluta: variáveis configuradas pelo usuário
  const userEnv =
    (process.env.APP_URL && process.env.APP_URL.trim()) ||
    (process.env.SITE_DOMAIN && process.env.SITE_DOMAIN.trim()) ||
    (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim());

  if (userEnv) {
    let normalized = userEnv.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    return normalized.replace(/\/+$/, '');
  }

  // 2. Resolução dinâmica via cabeçalhos HTTP da requisição (Vercel / Proxy / Servidor)
  if (req && typeof req.headers?.get === 'function') {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 3. Resolução automática das variáveis de produção nativas da Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/+$/, '');
  }

  // 4. Se executado no navegador do leitor
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 5. Fallback canônico
  return 'https://portalnews.com.br';
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
    secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT || '465') === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    receiver: process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER || 'contato@portalnews.com.br',
  },
  aiSummary: {
    endpoint: process.env.AI_SUMMARY_API_ENDPOINT || '',
    apiKey: process.env.AI_SUMMARY_API_KEY || '',
    model: process.env.AI_SUMMARY_MODEL || 'gpt-4o-mini',
  },
};
