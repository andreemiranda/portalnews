import { NextRequest, NextResponse } from 'next/server';
import { sanitizePublicData } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const isEnabled = Boolean(apiKey && voiceId);

  return NextResponse.json(
    sanitizePublicData({
      enabled: isEnabled,
      provider: isEnabled ? 'elevenlabs' : 'browser',
    })
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiUrl = (
    process.env.ELEVENLABS_API_URL ||
    'https://api.elevenlabs.io/v1/text-to-speech'
  ).replace(/\/+$/, '');

  // If ElevenLabs variables are not configured, tell client to use Web Speech API fallback
  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        enabled: false,
        fallback: 'web-speech',
        message: 'ElevenLabs não configurado. Utilizando síntese nativa do navegador.',
      },
      { status: 200 }
    );
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto não fornecido' }, { status: 400 });
    }

    // Limit text to 4000 characters for audio synthesis
    const trimmedText = text.slice(0, 4000);

    const elevenLabsEndpoint = `${apiUrl}/${voiceId}`;

    const res = await fetch(elevenLabsEndpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!res.ok) {
      console.warn(`ElevenLabs upstream responded with HTTP ${res.status}`);
      return NextResponse.json(
        {
          enabled: false,
          fallback: 'web-speech',
          error: `Erro ElevenLabs: HTTP ${res.status}`,
        },
        { status: 200 }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    console.error('Audio synthesis route error:', err);
    return NextResponse.json(
      {
        enabled: false,
        fallback: 'web-speech',
        error: 'Falha no processamento de áudio.',
      },
      { status: 200 }
    );
  }
}
