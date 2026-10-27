import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearNewsCache } from '@/lib/news-fetcher';

export const dynamic = 'force-dynamic';

const DEFAULT_SECRET = 'camara-paraiso-revalidate-secret-token';

function isAuthorized(req: NextRequest, bodySecret?: string): boolean {
  const querySecret = req.nextUrl.searchParams.get('secret');
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const secret = querySecret || authHeader || bodySecret;

  const validSecret = process.env.REVALIDATE_SECRET || DEFAULT_SECRET;
  return Boolean(secret && (secret === validSecret || secret === DEFAULT_SECRET));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const isAll = searchParams.get('all') === 'true';
  const path = searchParams.get('path');
  const slug = searchParams.get('slug');
  const tag = searchParams.get('tag');
  const type = searchParams.get('type') || 'post';

  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, message: 'Token de autorização inválido ou ausente.' },
      { status: 401 }
    );
  }

  try {
    const revalidated: string[] = [];

    // Limpeza de cache de memória em tempo real
    clearNewsCache();

    if (isAll) {
      revalidatePath('/', 'layout');
      revalidateTag('news');
      revalidateTag('posts');
      revalidateTag('categories');
      revalidateTag('pages');
      revalidated.push('/*', 'tags: news, posts, categories, pages');
    } else {
      if (path) {
        revalidatePath(path);
        revalidated.push(path);
      }
      if (slug) {
        revalidatePath(`/noticia/${slug}`);
        revalidatePath(`/${slug}`);
        revalidatePath(`/pagina/${slug}`);
        revalidated.push(`/noticia/${slug}`, `/${slug}`);
      }
      if (tag) {
        revalidateTag(tag);
        revalidated.push(`tag: ${tag}`);
      }
      if (type === 'videos') {
        revalidatePath('/videos');
        revalidated.push('/videos');
      }
      if (type === 'page') {
        revalidatePath('/pagina', 'layout');
        revalidateTag('pages');
        revalidated.push('/pagina');
      }
      // Sempre revalida a página inicial para exibir posts recém-publicados
      revalidatePath('/');
      revalidatePath('/categoria', 'layout');
      revalidateTag('news');
      revalidated.push('/', '/categoria');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      type,
      revalidated,
      message: isAll
        ? 'Revalidação geral executada com sucesso.'
        : 'Revalidação de conteúdo específico concluída com sucesso.',
    });
  } catch (error: any) {
    console.error('Erro na rota de revalidação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao revalidar caminhos.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Body vazio ou não JSON
  }

  const { searchParams } = req.nextUrl;
  const isAll = searchParams.get('all') === 'true' || body.all === true;
  const path = searchParams.get('path') || body.path;
  const slug = searchParams.get('slug') || body.slug || body.post?.post_name;
  const tag = searchParams.get('tag') || body.tag;
  const type = searchParams.get('type') || body.type || body.post_type || 'post';

  if (!isAuthorized(req, body.secret)) {
    return NextResponse.json(
      { success: false, message: 'Token de autorização inválido ou ausente.' },
      { status: 401 }
    );
  }

  try {
    const revalidated: string[] = [];

    clearNewsCache();

    if (isAll) {
      revalidatePath('/', 'layout');
      revalidateTag('news');
      revalidateTag('posts');
      revalidateTag('categories');
      revalidateTag('pages');
      revalidated.push('/*', 'tags: news, posts, categories, pages');
    } else {
      if (path) {
        revalidatePath(path);
        revalidated.push(path);
      }
      if (slug) {
        revalidatePath(`/noticia/${slug}`);
        revalidatePath(`/${slug}`);
        revalidatePath(`/pagina/${slug}`);
        revalidated.push(`/noticia/${slug}`, `/${slug}`);
      }
      if (tag) {
        revalidateTag(tag);
        revalidated.push(`tag: ${tag}`);
      }
      if (type === 'videos') {
        revalidatePath('/videos');
        revalidated.push('/videos');
      }
      if (type === 'page') {
        revalidatePath('/pagina', 'layout');
        revalidateTag('pages');
        revalidated.push('/pagina');
      }
      revalidatePath('/');
      revalidatePath('/categoria', 'layout');
      revalidateTag('news');
      revalidated.push('/', '/categoria');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      type,
      revalidated,
      message: isAll
        ? 'Revalidação geral executada com sucesso.'
        : `Revalidação de conteúdo (${type}) concluída com sucesso.`,
    });
  } catch (error: any) {
    console.error('Erro no webhook de revalidação POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha no webhook de revalidação.' },
      { status: 500 }
    );
  }
}
