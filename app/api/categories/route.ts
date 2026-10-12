import { NextResponse } from 'next/server';
import { ALL_CATEGORIES, ALL_NEWS_SOURCES } from '@/lib/sources';
import { NEWS_API_CONFIG } from '@/lib/api-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Optionally fetch live categories count from upstream with a quick timeout
    let upstreamCategories: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${NEWS_API_CONFIG.baseUrl}${NEWS_API_CONFIG.endpoints.categories}`, {
        headers: {
          'x-api-key': NEWS_API_CONFIG.apiKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          upstreamCategories = json.data;
        }
      }
    } catch {
      // Fallback to local static map
    }

    const categoriesWithCounts = ALL_CATEGORIES.map((cat) => {
      const sourcesCount = ALL_NEWS_SOURCES.filter(
        (s) => s.category.toLowerCase() === cat.id.toLowerCase()
      ).length;

      const upstreamMatch = upstreamCategories.find(
        (u) => (u.category || '').toLowerCase() === cat.id.toLowerCase()
      );

      return {
        id: cat.id,
        name: cat.name,
        count: upstreamMatch?.count || sourcesCount || 1,
        highlight: cat.highlight || false,
        group: cat.group || 'tema',
      };
    });

    return NextResponse.json({
      success: true,
      total: categoriesWithCounts.length,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        total: ALL_CATEGORIES.length,
        categories: ALL_CATEGORIES,
      },
      { status: 200 }
    );
  }
}
