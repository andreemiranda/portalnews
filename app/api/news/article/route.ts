import { NextRequest, NextResponse } from 'next/server';
import { fetchFullArticleBody, ensureCompleteArticleText } from '@/lib/article-extractor';
import { sanitizePublicData } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || searchParams.get('link') || '';
  const title = searchParams.get('title') || 'Notícia';
  const category = searchParams.get('category') || 'Geral';
  const rawText = searchParams.get('text') || '';

  try {
    let fullText: string | null = null;

    if (url && url.startsWith('http')) {
      fullText = await fetchFullArticleBody(url, 4500);
    }

    if (!fullText || fullText.length < 300) {
      fullText = ensureCompleteArticleText(rawText || title, title, category);
    }

    const payload = {
      success: true,
      contentHtml: fullText,
    };

    return NextResponse.json(sanitizePublicData(payload));
  } catch (error: any) {
    const fallbackText = ensureCompleteArticleText(rawText || title, title, category);
    return NextResponse.json(
      sanitizePublicData({
        success: true,
        contentHtml: fallbackText,
      })
    );
  }
}
