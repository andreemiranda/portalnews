import { ALL_NEWS_SOURCES, getSourcesByCategory, getSourceById } from '@/lib/sources';
import { NEWS_API_CONFIG } from '@/lib/api-config';
import { NewsItem, NewsApiSourceItem } from '@/lib/types';
import { cleanFullNewsText, cleanTitle, isForbiddenVideoPost, decodeHtmlEntities, removeTruncationMarkers } from '@/lib/sanitizer';
import { ensureCompleteArticleText } from '@/lib/article-extractor';
import { slugify } from '@/lib/slug';
import { getEditorialSeedNews } from '@/lib/seed-news';

interface CacheEntry {
  timestamp: number;
  data: NewsItem[];
}

const memoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes high-speed cache for instant article opening

export const DEFAULT_ALL_SOURCE_IDS = [
  '832514384744418', // Pará
  '119319283249741', // Notícias Gerais
  '432221191486213', // Notícias Gerais
  '859131619791157', // Economia
  '411718493791472', // Economia
  '119282349536522', // Justiça
  '382992878388555', // Justiça
  '893766336492326', // Educação
  '331649958919499', // Esporte
  '158311376392135', // Tecnologia e Games
  '383841537673882', // Tocantins
  '699842191757118', // Goiás
  '363855955883429', // Santa Catarina
  '499199511484742', // Paraná
  '477372321386414', // Mundo
  '914761953262293', // Finanças
];

function formatTimeAgo(dateString?: string, rawTimeAgo?: string): string {
  if (!dateString) return rawTimeAgo || 'Recente';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return rawTimeAgo || 'Recente';

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  // Menos de 1 minuto
  if (diffInSeconds < 60) return 'Agora mesmo';

  // Menos de 1 hora: em minutos
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `Há ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
  }

  // Menos de 24 horas: em horas
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  // Entre 24 e 48 horas: Ontem
  if (diffInSeconds < 172800) {
    return 'Ontem';
  }

  // Posterior a 48 horas: SOMENTE a data no formato dd/mm/aaaa
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Hosts that are fake or invalid image strings
export function isForbiddenImageHost(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('placeholder') ||
    lower.includes('data:image') ||
    lower.includes('pixel') ||
    lower.includes('1x1')
  );
}

function isValidHttpImageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  if (isForbiddenImageHost(trimmed)) return false;
  return true;
}

// Extract only original source images from API or image records, discarding forbidden/broken hosts
function extractOriginalImageUrl(item: any, imgRecord?: any): string | undefined {
  const check = (candidate?: any): string | undefined => {
    if (typeof candidate === 'string' && isValidHttpImageUrl(candidate)) {
      return candidate.trim();
    }
    return undefined;
  };

  // 1. Direct item properties
  const direct =
    check(item?.imageUrl) ||
    check(item?.mediaUrl) ||
    (item?.url && /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(item.url) ? check(item.url) : undefined) ||
    check(item?.enclosure?.url);
  if (direct) return direct;

  // 2. Matching image record from /api/images/:id
  if (imgRecord) {
    const fromRecord =
      check(imgRecord.imageUrl) ||
      check(imgRecord.mediaUrl) ||
      check(imgRecord.source_url) ||
      check(imgRecord.url) ||
      check(imgRecord.raw?.source_url) ||
      check(imgRecord.raw?.guid?.rendered) ||
      (imgRecord.link && /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(imgRecord.link) ? check(imgRecord.link) : undefined);
    if (fromRecord) return fromRecord;
  }

  // 3. Scan embedded <img> tags in content or description
  const contentToScan = `${item?.content || ''} ${item?.description || ''} ${imgRecord?.content || ''} ${imgRecord?.description || ''}`;
  const imgMatches = contentToScan.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    const found = check(match[1]);
    if (found) return found;
  }

  // 4. Raw media enclosures
  const rawEnc = check(item?.raw?.enclosure?.[0]?.$?.url) || check(item?.raw?.['media:content']?.[0]?.$?.url);
  if (rawEnc) return rawEnc;

  return undefined;
}

async function fetchWithFallback(primaryUrl: string, fallbackUrl: string): Promise<any> {
  const fetchWithTimeout = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);
    try {
      const res = await fetch(url, {
        headers: {
          'x-api-key': NEWS_API_CONFIG.apiKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  try {
    return await fetchWithTimeout(primaryUrl);
  } catch {
    try {
      return await fetchWithTimeout(fallbackUrl);
    } catch {
      return null;
    }
  }
}

async function fetchFromUpstreamSource(source: NewsApiSourceItem): Promise<NewsItem[]> {
  const newsPrimary = `${NEWS_API_CONFIG.baseUrl}/api/news/${source.id}`;
  const newsFallback = `${NEWS_API_CONFIG.fallbackUrl}/api/news/${source.id}`;
  const imgPrimary = `${NEWS_API_CONFIG.baseUrl}/api/images/${source.id}`;
  const imgFallback = `${NEWS_API_CONFIG.fallbackUrl}/api/images/${source.id}`;

  // Fetch news items and original images simultaneously in parallel
  const [newsResult, imagesResult] = await Promise.allSettled([
    fetchWithFallback(newsPrimary, newsFallback),
    fetchWithFallback(imgPrimary, imgFallback),
  ]);

  const rawItems = newsResult.status === 'fulfilled' && Array.isArray(newsResult.value) ? newsResult.value : [];
  const rawImages = imagesResult.status === 'fulfilled' && Array.isArray(imagesResult.value) ? imagesResult.value : [];

  if (rawItems.length === 0) return [];

  // Build fast lookups for original image records
  const imageById = new Map<string, any>();
  const imageBySlug = new Map<string, any>();
  const imageByLink = new Map<string, any>();

  rawImages.forEach((img) => {
    if (img.id != null) imageById.set(String(img.id), img);
    if (img.slug) imageBySlug.set(String(img.slug), img);
    if (img.link) imageByLink.set(String(img.link), img);
  });

  const sanitizedItems: NewsItem[] = [];

  for (let idx = 0; idx < rawItems.length; idx++) {
    const item = rawItems[idx];
    const rawTitle = item.title?.trim() || '';

    // Collect all candidate text fields from the item
    const rawCandidates = [
      item['content:encoded'],
      item.content,
      item.description,
      item.fullText,
      item.summary,
      item.raw?.content,
      item.raw?.description,
      item.raw?.body,
    ].filter((c): c is string => typeof c === 'string' && c.trim().length > 0);

    const combinedSample = rawCandidates.join(' ');
    // Filter out video posts
    if (isForbiddenVideoPost(rawTitle, combinedSample)) {
      continue;
    }

    const title = cleanTitle(rawTitle);
    if (!title || title.length < 5) continue;

    // Pick the candidate that produces the richest, longest clean text
    let fullCleanText = '';
    for (const cand of rawCandidates) {
      const cleaned = cleanFullNewsText(cand);
      if (cleaned.length > fullCleanText.length) {
        fullCleanText = cleaned;
      }
    }

    // If still very short, preserve raw stripped text to ensure no article is ever without content
    if (fullCleanText.length < 50 && rawCandidates.length > 0) {
      for (const cand of rawCandidates) {
        const fallbackClean = decodeHtmlEntities(cand.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
        if (fallbackClean.length > fullCleanText.length) {
          fullCleanText = fallbackClean;
        }
      }
    }

    // Generate a complete, untruncated summary and full article text
    let cleanSummaryText = '';
    if (fullCleanText.length > 0) {
      const firstPara = fullCleanText.split(/\n+/)[0] || fullCleanText;
      if (firstPara.length <= 260) {
        cleanSummaryText = removeTruncationMarkers(firstPara);
      } else {
        const sub = firstPara.slice(0, 260);
        const lastPeriod = sub.lastIndexOf('.');
        if (lastPeriod > 120) {
          cleanSummaryText = removeTruncationMarkers(sub.slice(0, lastPeriod + 1).trim());
        } else {
          const lastSpace = sub.lastIndexOf(' ');
          const trimmed = (lastSpace > 0 ? sub.slice(0, lastSpace) : sub)
            .replace(/[,;:\-\s]+(?:e|ou|mas|que|de|da|do|com|em|para)?\s*$/i, '')
            .trim();
          cleanSummaryText = removeTruncationMarkers(`${trimmed}.`);
        }
      }
    } else {
      cleanSummaryText = title;
    }

    // Ensure the full article content is completely assembled and never truncated
    const cleanFullContent = ensureCompleteArticleText(fullCleanText || title, title, source.category);

    // Find corresponding image record
    const matchedImg =
      (item.id != null && imageById.get(String(item.id))) ||
      (item.slug && imageBySlug.get(String(item.slug))) ||
      (item.link && imageByLink.get(String(item.link))) ||
      rawImages[idx] ||
      undefined;

    let imageUrl = extractOriginalImageUrl(item, matchedImg);

    // If still missing, borrow from source original images pool so NO news item is left without an image
    if (!imageUrl && rawImages.length > 0) {
      for (let p = 0; p < rawImages.length; p++) {
        const poolImg = rawImages[(idx + p) % rawImages.length];
        const cand = extractOriginalImageUrl(item, poolImg);
        if (cand && !isForbiddenImageHost(cand)) {
          imageUrl = cand;
          break;
        }
      }
    }
    const cleanTitleText = decodeHtmlEntities(title);
    const pubDate = item.pubDate || new Date().toISOString();
    const fallbackId = `${source.id}-${idx}`;
    const cleanSlug = slugify(cleanTitleText, fallbackId);
    const guid = cleanSlug || String(item.id || fallbackId);

    let rawAuthor = String(item.author || 'Portal News')
      .replace(/por\s+/gi, '')
      .replace(/\/\s*g1\b/gi, '')
      .replace(/,\s*g1\b/gi, '')
      .replace(/\bg1\b/gi, '')
      .replace(/\bo\s+liberal\b/gi, '')
      .replace(/\bdi[aá]rio\s+do\s+par[aá]\b/gi, '')
      .replace(/\bdol\b/gi, '')
      .replace(/coluna\s+do\s+ct/gi, '')
      .replace(/cleber\s+toledo/gi, '')
      .replace(/esporte\s+news\s+mundo/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!rawAuthor || rawAuthor.length < 3 || /^(admin|redacao|g1)$/i.test(rawAuthor) || /^\d+$/.test(rawAuthor)) {
      rawAuthor = 'Portal News';
    }

    sanitizedItems.push({
      id: String(guid),
      slug: cleanSlug,
      title: cleanTitleText,
      link: item.link || '#',
      pubDate,
      isoDate: pubDate,
      timeAgo: formatTimeAgo(pubDate, item.timeAgo),
      category: source.category,
      categoryId: source.category,
      source: 'Portal News',
      summary: decodeHtmlEntities(cleanSummaryText),
      contentHtml: decodeHtmlEntities(cleanFullContent),
      imageUrl,
      imageCaption: imageUrl ? `Registro jornalístico editorial • ${source.category}` : undefined,
      author: decodeHtmlEntities(rawAuthor),
    });
  }

  return sanitizedItems;
}

// Instant O(1) in-memory index for all news articles by slug, title-slug, and id
const itemIndexMap = new Map<string, NewsItem>();

function indexNewsItems(items: NewsItem[]) {
  for (const item of items) {
    if (item.slug) itemIndexMap.set(item.slug.toLowerCase().trim(), item);
    if (item.id) itemIndexMap.set(String(item.id).toLowerCase().trim(), item);
    if (item.title) {
      itemIndexMap.set(slugify(item.title).toLowerCase().trim(), item);
      itemIndexMap.set(slugify(item.title, item.id).toLowerCase().trim(), item);
    }
  }
}

export async function getLiveNews(options: {
  category?: string;
  sourceId?: string | null;
  searchQuery?: string;
  forceRefresh?: boolean;
} = {}): Promise<NewsItem[]> {
  const category = options.category || 'all';
  const sourceId = options.sourceId || null;
  const query = options.searchQuery || '';
  const force = options.forceRefresh || false;

  const cacheKey = `${category}_${sourceId || ''}_${query}`;

  if (!force && memoryCache[cacheKey] && Date.now() - memoryCache[cacheKey].timestamp < CACHE_TTL_MS) {
    indexNewsItems(memoryCache[cacheKey].data);
    return memoryCache[cacheKey].data;
  }

  let sourcesToFetch: NewsApiSourceItem[] = [];

  if (sourceId) {
    const single = getSourceById(sourceId);
    if (single) sourcesToFetch = [single];
  } else if (category !== 'all' && category !== 'favoritos') {
    sourcesToFetch = getSourcesByCategory(category);
  } else {
    sourcesToFetch = DEFAULT_ALL_SOURCE_IDS.map((id) => getSourceById(id)).filter(
      Boolean
    ) as NewsApiSourceItem[];
  }

  if (sourcesToFetch.length === 0) {
    sourcesToFetch = ALL_NEWS_SOURCES.slice(0, 10);
  }

  const fetchPromises = sourcesToFetch.map((src) => fetchFromUpstreamSource(src));
  const results = await Promise.allSettled(fetchPromises);

  const allNewsItems: NewsItem[] = [];
  results.forEach((res) => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allNewsItems.push(...res.value);
    }
  });

  // Collect all real source images to guarantee 100% of articles have images
  const categoryImagePool = new Map<string, string[]>();
  const globalImagePool: string[] = [];

  allNewsItems.forEach((item) => {
    if (item.imageUrl && item.imageUrl.startsWith('http')) {
      globalImagePool.push(item.imageUrl);
      const catList = categoryImagePool.get(item.category) || [];
      catList.push(item.imageUrl);
      categoryImagePool.set(item.category, catList);
    }
  });

  // Ensure absolutely no news item is left without an image
  allNewsItems.forEach((item, idx) => {
    if (!item.imageUrl || item.imageUrl.trim().length === 0) {
      const catPool = categoryImagePool.get(item.category);
      if (catPool && catPool.length > 0) {
        item.imageUrl = catPool[idx % catPool.length];
        item.imageCaption = `Registro jornalístico • ${item.category} / Portal News`;
      } else if (globalImagePool.length > 0) {
        item.imageUrl = globalImagePool[idx % globalImagePool.length];
        item.imageCaption = `Registro jornalístico • ${item.category} / Portal News`;
      } else {
        item.imageUrl = undefined;
        item.imageCaption = undefined;
      }
    }
  });

  // Deduplicate
  const uniqueMap = new Map<string, NewsItem>();
  allNewsItems.forEach((item) => {
    const normalizedKey = item.title.toLowerCase().trim();
    if (!uniqueMap.has(normalizedKey)) {
      uniqueMap.set(normalizedKey, item);
    }
  });

  let finalItems = Array.from(uniqueMap.values());

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    finalItems = finalItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  finalItems.sort((a, b) => {
    const dateA = new Date(a.isoDate || a.pubDate).getTime();
    const dateB = new Date(b.isoDate || b.pubDate).getTime();
    return dateB - dateA;
  });

  if (finalItems.length === 0) {
    const seeds = getEditorialSeedNews();
    if (category && category !== 'all' && category !== 'favoritos') {
      const filtered = seeds.filter(
        (s) => s.category.toLowerCase().trim() === category.toLowerCase().trim()
      );
      finalItems = filtered.length > 0 ? filtered : seeds;
    } else {
      finalItems = seeds;
    }
  }

  memoryCache[cacheKey] = {
    timestamp: Date.now(),
    data: finalItems,
  };
  indexNewsItems(finalItems);

  return finalItems;
}

/**
 * Busca uma notícia específica pelo seu slug ou id com resolução instantânea
 */
export async function getNewsItemBySlugOrId(slugOrId: string): Promise<NewsItem | null> {
  if (!slugOrId) return null;
  const target = decodeURIComponent(slugOrId).toLowerCase().trim();

  // 1. Resolução ultrarrápida O(1) pelo índice em memória
  if (itemIndexMap.has(target)) {
    return itemIndexMap.get(target)!;
  }

  // 2. Busca aproximada no índice de artigos conhecidos
  for (const item of itemIndexMap.values()) {
    const s = (item.slug || '').toLowerCase();
    const st = slugify(item.title || '').toLowerCase();
    if (s === target || st === target || s.includes(target) || target.includes(s)) {
      return item;
    }
  }

  // 3. Verificação em caches existentes em memória sem novas requisições de rede
  for (const entry of Object.values(memoryCache)) {
    if (entry?.data) {
      const match = entry.data.find(
        (it) =>
          it.slug.toLowerCase() === target ||
          slugify(it.title).toLowerCase() === target ||
          String(it.id).toLowerCase() === target ||
          (it.slug && (it.slug.toLowerCase().includes(target) || target.includes(it.slug.toLowerCase())))
      );
      if (match) {
        indexNewsItems(entry.data);
        return match;
      }
    }
  }

  // 4. Se não estiver no cache, carrega todas as notícias da home
  const allItems = await getLiveNews({ category: 'all' });
  const found = allItems.find(
    (item) =>
      item.slug.toLowerCase() === target ||
      slugify(item.title).toLowerCase() === target ||
      item.id.toLowerCase() === target ||
      item.id === slugOrId ||
      (item.slug && (item.slug.toLowerCase().includes(target) || target.includes(item.slug.toLowerCase())))
  );
  if (found) return found;

  return null;
}
