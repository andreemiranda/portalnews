export const SITE_CONFIG = {
  name: 'Portal News',
  shortName: 'Portal News',
  tagline: 'Jornalismo • Brasil e Cobertura Completa',
  description:
    'Portal de notícias com cobertura de política, economia, justiça, educação, esportes, tecnologia e notícias dos estados brasileiros.',
  domain:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_DOMAIN ||
    process.env.APP_URL ||
    'https://ais-dev-qyzbaiotwmw74wkgcp56qo-771752383788.us-east1.run.app',
  adsense: {
    clientId:
      process.env.NEXT_PUBLIC_ADSENSE_ID ||
      process.env.GOOGLE_ADSENSE_CLIENT_ID ||
      process.env.VITE_GOOGLE_ADSENSE_CLIENT_ID ||
      'ca-pub-7059730627018047',
    slots: {
      header:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER ||
        process.env.GOOGLE_ADSENSE_SLOT_HEADER ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_HEADER ||
        '5879052250',
      sidebar:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ||
        process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR ||
        '7453412822',
      sidebarBottom:
        process.env.GOOGLE_ADSENSE_SLOT_SIDEBAR_BOTTOM ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR_BOTTOM ||
        '9992449866',
      inArticle:
        process.env.GOOGLE_ADSENSE_SLOT_IN_ARTICLE ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_IN_ARTICLE ||
        '3456789012',
      footer:
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ||
        process.env.GOOGLE_ADSENSE_SLOT_FOOTER ||
        process.env.VITE_GOOGLE_ADSENSE_SLOT_FOOTER ||
        '1127017514',
    },
  },
  aiSummary: {
    endpoint: process.env.AI_SUMMARY_API_ENDPOINT || '',
    apiKey: process.env.AI_SUMMARY_API_KEY || '',
    model: process.env.AI_SUMMARY_MODEL || '',
  },
};
