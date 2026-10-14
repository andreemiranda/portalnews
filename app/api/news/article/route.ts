import { NextRequest, NextResponse } from 'next/server';
import { fetchFullArticleBody, ensureCompleteArticleText } from '@/lib/article-extractor';
import { getNewsItemBySlugOrId } from '@/lib/news-fetcher';
import { sanitizePublicData } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slugParam = searchParams.get('slug') || searchParams.get('id');
  const urlParam = searchParams.get('url') || searchParams.get('link') || '';
  const titleParam = searchParams.get('title') || 'Notícia';
  const categoryParam = searchParams.get('category') || 'Geral';
  const rawTextParam = searchParams.get('text') || '';

  try {
    let item = null;
    if (slugParam) {
      item = await getNewsItemBySlugOrId(slugParam);
    }

    const targetUrl = urlParam || item?.link || '';
    const targetTitle = item?.title || titleParam;
    const targetCategory = item?.category || categoryParam;
    const targetRawText = item?.contentHtml || item?.summary || rawTextParam;

    let fullText: string | null = null;
    if (targetUrl && targetUrl.startsWith('http')) {
      fullText = await fetchFullArticleBody(targetUrl, 4500);
    }

    if (!fullText || fullText.length < 300) {
      fullText = ensureCompleteArticleText(targetRawText || targetTitle, targetTitle, targetCategory);
    }

    const payload = {
      success: true,
      item: item ? { ...item, contentHtml: fullText } : null,
      contentHtml: fullText,
    };

    return NextResponse.json(sanitizePublicData(payload));
  } catch {
    const fallbackText = ensureCompleteArticleText(rawTextParam || titleParam, titleParam, categoryParam);
    return NextResponse.json(
      sanitizePublicData({
        success: true,
        item: null,
        contentHtml: fallbackText,
      })
    );
  }
}
