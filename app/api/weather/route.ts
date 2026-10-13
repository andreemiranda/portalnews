import { NextRequest, NextResponse } from 'next/server';
import { sanitizePublicData } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'Brasilia';

  const apiKey =
    process.env.WEATHER_API_KEY ||
    process.env.api_key_clima ||
    '';

  if (!apiKey) {
    return processWeatherData(getDefaultWeatherPayload(q));
  }

  const baseUrl = (
    process.env.api_url_clima_base ||
    process.env.WEATHER_API_BASE_URL ||
    'https://api.weatherapi.com/v1'
  ).replace(/\/+$/, '');

  try {
    const url = `${baseUrl}/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      q
    )}&days=1&lang=pt&aqi=no`;

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes cache
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      // If user's geo lookup fails, fallback to Brasilia
      if (q !== 'Brasilia') {
        const fallbackUrl = `${baseUrl}/forecast.json?key=${apiKey}&q=Brasilia&days=1&lang=pt&aqi=no`;
        const fbRes = await fetch(fallbackUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          return processWeatherData(fbData);
        }
      }
      return NextResponse.json(
        { error: 'Não foi possível obter dados meteorológicos' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return processWeatherData(data);
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Falha na conexão com serviço de clima' },
      { status: 500 }
    );
  }
}

function processWeatherData(data: any) {
  const location = data.location || {};
  const current = data.current || {};
  const forecastDay = data.forecast?.forecastday?.[0]?.day || {};

  const conditionText = current.condition?.text || 'Estável';
  const conditionCode = current.condition?.code || 1000;
  const isDay = current.is_day === 1;

  // Determine theme based on condition
  let theme: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'storm' | 'night' = 'partly_cloudy';

  if (!isDay) {
    theme = 'night';
  } else if ([1000].includes(conditionCode)) {
    theme = 'sunny';
  } else if ([1003, 1006].includes(conditionCode)) {
    theme = 'partly_cloudy';
  } else if ([1009, 1030, 1135, 1147].includes(conditionCode)) {
    theme = 'cloudy';
  } else if (
    [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)
  ) {
    theme = 'rainy';
  } else if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    theme = 'storm';
  }

  // UV index classification
  const uvVal = current.uv || 0;
  let uvLabel = 'Baixo';
  if (uvVal >= 8) uvLabel = 'Muito Alto';
  else if (uvVal >= 6) uvLabel = 'Alto';
  else if (uvVal >= 3) uvLabel = 'Moderado';

  return NextResponse.json(
    sanitizePublicData({
      location: {
        name: location.name || 'Cidade',
        region: location.region || '',
        country: location.country || 'Brasil',
        localtime: location.localtime || '',
      },
      current: {
        tempC: Math.round(current.temp_c || 0),
        feelsLikeC: Math.round(current.feelslike_c || current.temp_c || 0),
        condition: conditionText,
        icon: current.condition?.icon?.startsWith('//')
          ? `https:${current.condition.icon}`
          : current.condition?.icon,
        humidity: current.humidity || 0,
        windKph: Math.round(current.wind_kph || 0),
        windDir: current.wind_dir || '',
        uv: uvVal,
        uvLabel,
        isDay,
      },
      forecast: {
        maxTempC: Math.round(forecastDay.maxtemp_c || current.temp_c || 0),
        minTempC: Math.round(forecastDay.mintemp_c || current.temp_c || 0),
        chanceOfRain: forecastDay.daily_chance_of_rain || 0,
        condition: forecastDay.condition?.text || conditionText,
      },
      theme,
    })
  );
}

function getDefaultWeatherPayload(locationName: string) {
  return {
    location: {
      name: locationName || 'Brasília',
      region: 'Distrito Federal',
      country: 'Brasil',
      localtime: new Date().toISOString(),
    },
    current: {
      temp_c: 26,
      feelslike_c: 27,
      humidity: 58,
      wind_kph: 14,
      wind_dir: 'E',
      uv: 5,
      is_day: 1,
      condition: {
        text: 'Sol com algumas nuvens',
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
        code: 1003,
      },
    },
    forecast: {
      forecastday: [
        {
          day: {
            maxtemp_c: 30,
            mintemp_c: 19,
            daily_chance_of_rain: 15,
            condition: {
              text: 'Parcialmente nublado',
              code: 1003,
            },
          },
        },
      ],
    },
  };
}
