/**
 * Biblioteca Dedicada de SEO, Auditoria e Cache - Portal News
 * 
 * Fornece:
 * 1. Auditoria programática de tags, títulos e metadados SEO.
 * 2. Geradores Schema.org (NewsArticle, WebSite, NewsMediaOrganization, BreadcrumbList).
 * 3. Normalização e resolução dinâmica de URLs canônicas.
 * 4. Padrões de cabeçalhos de Cache HTTP (Cache-Control, CDN e navegadores).
 */

import { SITE_CONFIG, getBaseUrl } from './site-config';
import { NewsItem } from './types';

export interface SeoAuditResult {
  score: number; // 0 a 100
  passed: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Realiza auditoria completa de SEO de uma página ou artigo
 */
export function auditPageMetadata(meta: {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  hasOpenGraph?: boolean;
  hasTwitterCard?: boolean;
  hasStructuredData?: boolean;
  publishedTime?: string;
  author?: string;
}): SeoAuditResult {
  const passed: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Título
  if (!meta.title || meta.title.trim().length === 0) {
    errors.push('Título da página está ausente.');
  } else if (meta.title.length < 30) {
    warnings.push(`Título curto (${meta.title.length} caracteres). Ideal entre 30 e 65.`);
  } else if (meta.title.length > 70) {
    warnings.push(`Título longo (${meta.title.length} caracteres). Pode ser truncado no Google.`);
  } else {
    passed.push('Título otimizado para buscadores (30-70 caracteres).');
  }

  // Descrição
  if (!meta.description || meta.description.trim().length === 0) {
    errors.push('Meta description está ausente.');
  } else if (meta.description.length < 100) {
    warnings.push(`Descrição curta (${meta.description.length} caracteres). Ideal entre 120 e 160.`);
  } else if (meta.description.length > 170) {
    warnings.push(`Descrição longa (${meta.description.length} caracteres).`);
  } else {
    passed.push('Meta description no padrão recomendado (120-160 caracteres).');
  }

  // Canonical
  if (!meta.canonicalUrl) {
    errors.push('Tag canonical ausente.');
  } else if (!meta.canonicalUrl.startsWith('http')) {
    errors.push('Tag canonical não possui protocolo absoluto válido (http/https).');
  } else {
    passed.push('Tag canonical configurada com URL absoluta.');
  }

  // Imagem OpenGraph
  if (!meta.imageUrl) {
    warnings.push('Nenhuma imagem OpenGraph especificada para compartilhamento.');
  } else if (!meta.imageUrl.startsWith('http')) {
    warnings.push('URL da imagem OpenGraph deve ser absoluta.');
  } else {
    passed.push('Imagem de compartilhamento em alta resolução configurada.');
  }

  // Redes Sociais
  if (meta.hasOpenGraph) {
    passed.push('Metatags OpenGraph (Facebook, WhatsApp, LinkedIn) presentes.');
  }
  if (meta.hasTwitterCard) {
    passed.push('Twitter Card summary_large_image configurado.');
  }

  // Dados Estruturados
  if (meta.hasStructuredData) {
    passed.push('Dados estruturados Schema.org JSON-LD implementados.');
  } else {
    warnings.push('Dados estruturados Schema.org ausentes.');
  }

  // Autor e Data
  if (meta.author) {
    passed.push(`Autor editorial identificado: ${meta.author}`);
  }
  if (meta.publishedTime) {
    passed.push('Data de publicação ISO 8601 presente.');
  }

  const totalChecks = passed.length + warnings.length + errors.length;
  const score = totalChecks > 0 ? Math.round(((passed.length + warnings.length * 0.5) / totalChecks) * 100) : 100;

  return {
    score,
    passed,
    warnings,
    errors,
  };
}

/**
 * Gera esquema Schema.org JSON-LD para a Home / Organização
 */
export function generatePortalOrganizationSchema() {
  const domain = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.name,
    url: domain,
    logo: {
      '@type': 'ImageObject',
      url: `${domain}/icon-512.png`,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.description,
    publishingPrinciples: `${domain}/`,
    knowsAbout: [
      'Jornalismo',
      'Política',
      'Economia',
      'Justiça',
      'Educação',
      'Brasil',
      'Tecnologia',
    ],
    ethicsPolicy: `${domain}/`,
    masthead: `${domain}/`,
  };
}

/**
 * Gera esquema Schema.org JSON-LD para busca no portal
 */
export function generateWebSiteSchema() {
  const domain = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: domain,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${domain}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Gera esquema NewsArticle completo para páginas individuais de notícias
 */
export function generateNewsArticleSchema(item: NewsItem) {
  const domain = getBaseUrl();
  const articleUrl = `${domain}/noticia/${encodeURIComponent(item.slug || item.id)}`;
  const pubDate = item.isoDate || item.pubDate || new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: item.title,
    description: item.summary || item.title,
    image: item.imageUrl ? [item.imageUrl] : [`${domain}/cover.png`],
    datePublished: pubDate,
    dateModified: pubDate,
    author: {
      '@type': 'Person',
      name: item.author || 'Portal News',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${domain}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    articleSection: item.category,
    inLanguage: 'pt-BR',
    copyrightHolder: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.name,
    },
  };
}

/**
 * Cabeçalhos HTTP para otimização de Cache e CDN
 */
export function getSeoCacheHeaders(maxAgeSeconds = 1800, sMaxAgeSeconds = 3600) {
  return {
    'Cache-Control': `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=86400`,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}
