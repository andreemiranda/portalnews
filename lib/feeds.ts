import { FeedSource } from './types';
import { ALL_NEWS_SOURCES } from './sources';

export const DEFAULT_FEEDS: FeedSource[] = ALL_NEWS_SOURCES.map((s) => ({
  id: s.id,
  name: s.name || `${s.category} (${s.site})`,
  url: `https://api-news-media.netlify.app/api/news/${s.id}`,
  category: s.category,
}));
