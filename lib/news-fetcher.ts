import { ALL_NEWS_SOURCES, getSourcesByCategory, getSourceById } from '@/lib/sources';
import { NEWS_API_CONFIG } from '@/lib/api-config';
import { NewsItem, NewsApiSourceItem } from '@/lib/types';
import { cleanFullNewsText, cleanTitle, isForbiddenVideoPost, decodeHtmlEntities } from '@/lib/sanitizer';
import { slugify } from '@/lib/slug';

interface CacheEntry {
  timestamp: number;
  data: NewsItem[];
}

const memoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache

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

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Recente';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recente';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `Há ${mins} min${mins > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Há ${hours} h${hours > 1 ? 'ras' : ''}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'Ontem';
  return `Há ${days} dias`;
}

// Extract only original source images from API or image records.
function extractOriginalImageUrl(item: any, imgRecord?: any): string | undefined {
  // 1. Direct item properties
  if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) {
    return item.imageUrl;
  }
  if (item?.mediaUrl && typeof item.mediaUrl === 'string' && item.mediaUrl.startsWith('http')) {
    return item.mediaUrl;
  }
  if (item?.url && typeof item.url === 'string' && item.url.startsWith('http') && /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(item.url)) {
    return item.url;
  }
  if (item?.enclosure?.url && typeof item.enclosure.url === 'string' && item.enclosure.url.startsWith('http')) {
    return item.enclosure.url;
  }

  // 2. Matching image record from /api/images/:id
  if (imgRecord) {
    if (imgRecord.imageUrl && typeof imgRecord.imageUrl === 'string' && imgRecord.imageUrl.startsWith('http')) {
      return imgRecord.imageUrl;
    }
    if (imgRecord.mediaUrl && typeof imgRecord.mediaUrl === 'string' && imgRecord.mediaUrl.startsWith('http')) {
      return imgRecord.mediaUrl;
    }
    if (imgRecord.source_url && typeof imgRecord.source_url === 'string' && imgRecord.source_url.startsWith('http')) {
      return imgRecord.source_url;
    }
    if (imgRecord.url && typeof imgRecord.url === 'string' && imgRecord.url.startsWith('http')) {
      return imgRecord.url;
    }
    if (imgRecord.raw?.source_url && typeof imgRecord.raw.source_url === 'string' && imgRecord.raw.source_url.startsWith('http')) {
      return imgRecord.raw.source_url;
    }
    if (imgRecord.raw?.guid?.rendered && typeof imgRecord.raw.guid.rendered === 'string' && imgRecord.raw.guid.rendered.startsWith('http')) {
      return imgRecord.raw.guid.rendered;
    }
    if (imgRecord.link && typeof imgRecord.link === 'string' && /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(imgRecord.link)) {
      return imgRecord.link;
    }
  }

  // 3. Scan embedded <img> tags in content or description
  const contentToScan = `${item?.content || ''} ${item?.description || ''} ${imgRecord?.content || ''} ${imgRecord?.description || ''}`;
  const imgMatch = contentToScan.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
    return imgMatch[1];
  }

  // 4. Raw media enclosures
  if (item?.raw?.enclosure?.[0]?.$?.url) {
    return item.raw.enclosure[0].$.url;
  }
  if (item?.raw?.['media:content']?.[0]?.$?.url) {
    return item.raw['media:content'][0].$.url;
  }

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

    const cleanSummaryText = fullCleanText.length > 0 ? fullCleanText.slice(0, 320).trim() : title;
    const cleanFullContent = fullCleanText.length > 0 ? fullCleanText : title;

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
      const poolImg = rawImages[idx % rawImages.length];
      imageUrl = extractOriginalImageUrl(item, poolImg);
    }
    const cleanTitleText = decodeHtmlEntities(title);
    const pubDate = item.pubDate || new Date().toISOString();
    const fallbackId = `${source.id}-${idx}`;
    const cleanSlug = slugify(cleanTitleText, fallbackId);
    const guid = cleanSlug || String(item.id || fallbackId);

    let rawAuthor = String(item.author || 'Redação Portal News')
      .replace(/por\s+/gi, '')
      .replace(/\/\s*g1\b/gi, '')
      .replace(/,\s*g1\b/gi, '')
      .replace(/\bg1\b/gi, '')
      .replace(/\bo\s+liberal\b/gi, '')
      .replace(/\bdi[aá]rio\s+do\s+par[aá]\b/gi, '')
      .replace(/\bdol\b/gi, '')
      .trim();

    if (!rawAuthor || rawAuthor.length < 3 || /^(admin|redacao|g1)$/i.test(rawAuthor)) {
      rawAuthor = 'Redação Portal News';
    }

    sanitizedItems.push({
      id: String(guid),
      slug: cleanSlug,
      title: cleanTitleText,
      link: item.link || '#',
      pubDate,
      isoDate: pubDate,
      timeAgo: formatTimeAgo(pubDate),
      category: source.category,
      categoryId: source.category,
      source: source.name || source.site || 'Portal News',
      summary: decodeHtmlEntities(cleanSummaryText),
      contentHtml: decodeHtmlEntities(cleanFullContent),
      imageUrl,
      imageCaption: imageUrl ? `Registro original da fonte • ${source.category} / Portal News` : undefined,
      author: decodeHtmlEntities(rawAuthor),
    });
  }

  return sanitizedItems;
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
      } else if (globalImagePool.length > 0) {
        item.imageUrl = globalImagePool[idx % globalImagePool.length];
      } else {
        item.imageUrl = '/cover.png';
      }
      item.imageCaption = `Registro jornalístico • ${item.category} / Portal News`;
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
    finalItems = [
      {
        id: 'destaque-1',
        slug: slugify('Principais indicadores econômicos e balanço financeiro nacional apontam estabilidade'),
        title: 'Principais indicadores econômicos e balanço financeiro nacional apontam estabilidade',
        link: '#',
        pubDate: new Date().toISOString(),
        isoDate: new Date().toISOString(),
        timeAgo: 'Agora mesmo',
        category: 'Economia',
        categoryId: 'Economia',
        source: 'Portal News',
        summary:
          'Balanço recente divulgado pelos órgãos reguladores aponta equilíbrio no mercado produtivo e nas projeções para o próximo trimestre.',
        contentHtml:
          'Balanço recente divulgado pelos órgãos reguladores aponta equilíbrio no mercado produtivo e nas projeções para o próximo trimestre. Especialistas analisam a conjuntura econômica e a sustentabilidade das operações de investimentos.',
        author: 'Redação Portal News',
      },
    ];
  }

  memoryCache[cacheKey] = {
    timestamp: Date.now(),
    data: finalItems,
  };

  return finalItems;
}
