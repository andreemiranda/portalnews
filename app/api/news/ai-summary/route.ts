import { NextRequest, NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

// In-memory cache for generated summaries to prevent hitting rate limits
const summaryCache = new Map<string, { summary: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

// Rate limit helper: minimum 1.2s delay between consecutive free community calls
let lastPollinationsCallTime = 0;
async function throttlePollinationsCall(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastPollinationsCallTime;
  if (timeSinceLast < 1200) {
    const delay = 1200 - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastPollinationsCallTime = Date.now();
}

/**
 * Gera um resumo de apenas um parágrafo usando o endpoint gratuito da Pollinations.AI
 * @param {string} textoNoticia - O texto completo e bruto da notícia
 * @returns {Promise<string>} O parágrafo de resumo gerado
 */
async function resumirNoticiaSemChave(textoNoticia: string): Promise<string> {
  await throttlePollinationsCall();
  const url = 'https://text.pollinations.ai/';

  // Limit input text length to avoid token limit or timeouts
  const truncatedText = textoNoticia.length > 2500 ? textoNoticia.slice(0, 2500) : textoNoticia;

  const payload = {
    messages: [
      {
        role: 'system',
        content:
          'Você é um assistente jornalístico especialista. Seu único objetivo é resumir o texto fornecido pelo usuário em exatamente UM único parágrafo curto, direto e informativo. Nunca use saudações, introduções ou marcadores.',
      },
      {
        role: 'user',
        content: truncatedText,
      },
    ],
    model: 'openai',
    jsonMode: false,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro na API Pollinations: ${response.statusText}`);
    }

    const rawResumo = await response.text();
    // Controle de Parágrafo Único: split('\n')[0] para capturar apenas a primeira linha/parágrafo
    const primeiroParagrafo = rawResumo.split('\n')[0].replace(/^["']|["']$/g, '').trim();
    if (primeiroParagrafo.length > 15) {
      return primeiroParagrafo;
    }
    return rawResumo.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Falha no POST Pollinations, tentando via GET:', error);
    return await resumirNoticiaViaURL(textoNoticia);
  }
}

/**
 * Fallback via GET URL conforme documentação Pollinations.AI
 */
async function resumirNoticiaViaURL(textoNoticia: string): Promise<string> {
  await throttlePollinationsCall();
  const sample = textoNoticia.slice(0, 1200);
  const instrucao = `Resuma o texto a seguir em apenas um parágrafo curto de jornalismo: ${sample}`;
  const url = `https://text.pollinations.ai/${encodeURIComponent(instrucao)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawResumo = await response.text();
    const primeiroParagrafo = rawResumo.split('\n')[0].replace(/^["']|["']$/g, '').trim();
    return primeiroParagrafo || rawResumo.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Falha ao chamar via GET Pollinations:', error);
    // Fallback inteligente determinístico: extração jornalística do lead
    const sentences = textoNoticia.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 25);
    const leadSentences = sentences.slice(0, 3).join(' ');
    return leadSentences || textoNoticia.slice(0, 280);
  }
}

export async function GET() {
  const hasCustom = Boolean(SITE_CONFIG.aiSummary.endpoint && SITE_CONFIG.aiSummary.apiKey);
  return NextResponse.json({
    enabled: true,
    provider: hasCustom ? 'custom' : 'pollinations',
    model: SITE_CONFIG.aiSummary.model || 'openai (pollinations)',
  });
}

export async function POST(req: NextRequest) {
  const customEndpoint = SITE_CONFIG.aiSummary.endpoint?.trim();
  const customApiKey = SITE_CONFIG.aiSummary.apiKey?.trim();
  const customModel = SITE_CONFIG.aiSummary.model || 'gpt-4o-mini';

  try {
    const { title, summary, link } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
    }

    const fullArticleText = `${title}. ${summary || ''}`.trim();
    const cacheKey = title.toLowerCase().trim();

    // Check memory cache
    const cached = summaryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.summary);
    }

    let finalExecutiveSummary = '';

    // 1. If custom variables with values are configured, use custom endpoint
    if (customEndpoint && customApiKey) {
      let targetUrl = customEndpoint;
      if (
        !targetUrl.includes('/chat/completions') &&
        !targetUrl.includes('/generate') &&
        !targetUrl.includes('/completions')
      ) {
        targetUrl = `${targetUrl.replace(/\/+$/, '')}/chat/completions`;
      }

      try {
        const customRes = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customApiKey}`,
            'x-api-key': customApiKey,
          },
          body: JSON.stringify({
            model: customModel,
            messages: [
              {
                role: 'system',
                content:
                  'Você é um editor sênior de jornalismo do Portal News. Resuma o texto em exatamente UM único parágrafo curto e direto.',
              },
              { role: 'user', content: fullArticleText },
            ],
            temperature: 0.2,
          }),
        });

        if (customRes.ok) {
          const aiData = await customRes.json();
          if (aiData.choices && aiData.choices[0]?.message?.content) {
            finalExecutiveSummary = aiData.choices[0].message.content.split('\n')[0].trim();
          }
        }
      } catch (err) {
        console.warn('Custom AI endpoint failed, falling back to Pollinations:', err);
      }
    }

    // 2. If no custom endpoint or custom call failed, use Pollinations.AI without API key
    if (!finalExecutiveSummary) {
      finalExecutiveSummary = await resumirNoticiaSemChave(fullArticleText);
    }

    // Enforce single paragraph control: split('\n')[0]
    finalExecutiveSummary = finalExecutiveSummary.split('\n')[0].replace(/^["']|["']$/g, '').trim();

    // Key points extraction for UI structure
    const keyPoints = [
      'Síntese informativa gerada por inteligência artificial',
      'Leitura rápida com foco nos pontos centrais dos fatos',
      'Notícia monitorada continuamente pela redação',
    ];

    const result = {
      executiveSummary: finalExecutiveSummary,
      keyPoints,
      context: 'Análise editorial e síntese automatizada • Portal News',
      topics: ['Destaque', 'Última Hora', 'Portal News'],
      provider: customEndpoint && customApiKey ? 'custom' : 'pollinations',
    };

    summaryCache.set(cacheKey, { summary: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      {
        executiveSummary: 'Resumo em processamento pela redação.',
        keyPoints: ['Acompanhe a cobertura completa na íntegra.'],
        context: 'Portal News',
        topics: ['Notícia'],
      },
      { status: 200 }
    );
  }
}
