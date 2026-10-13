import { NextRequest, NextResponse } from 'next/server';
import { getLiveNews } from '@/lib/news-fetcher';
import { sanitizePublicData } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get('category') || 'all';
  const sourceIdParam = searchParams.get('sourceId');
  const queryParam = searchParams.get('q') || '';
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    const items = await getLiveNews({
      category: categoryParam,
      sourceId: sourceIdParam,
      searchQuery: queryParam,
      forceRefresh,
    });

    const payload = {
      items,
      source: 'upstream',
      total: items.length,
      isRealTime: true,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(sanitizePublicData(payload));
  } catch (err: any) {
    console.error('API news error:', err);
    return NextResponse.json(
      { error: 'Erro ao carregar notícias', items: [] },
      { status: 500 }
    );
  }
}
