export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  link: string;
  pubDate: string;
  isoDate?: string;
  timeAgo: string;
  category: string;
  categoryId: string;
  source: string;
  summary: string;
  contentHtml?: string;
  imageUrl?: string;
  imageCaption?: string;
  author?: string;
  originalCategory?: string;
  isBookmarked?: boolean;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  iconName?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug?: string;
  count?: number;
  highlight?: boolean;
  group?: 'nacional' | 'regiao' | 'tema' | 'especial';
}

export interface NewsApiSourceItem {
  id: string;
  endpoint: string;
  category: string;
  site: string;
  type?: 'wp-api' | 'rss';
  name?: string;
}

export interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
}
