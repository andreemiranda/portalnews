'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Umbrella,
  Compass,
  MapPin,
  RefreshCw,
  Eye,
  Sparkles,
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    tempC: number;
    feelsLikeC: number;
    condition: string;
    icon?: string;
    humidity: number;
    windKph: number;
    windDir: string;
    uv: number;
    uvLabel: string;
    isDay: boolean;
  };
  forecast: {
    maxTempC: number;
    minTempC: number;
    chanceOfRain: number;
    condition: string;
  };
  theme: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'storm' | 'night';
}

const THEME_STYLES: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  sunny: {
    bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600',
    text: 'text-white',
    badge: 'bg-amber-400/30 text-white',
    border: 'border-amber-400/40',
  },
  partly_cloudy: {
    bg: 'bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700',
    text: 'text-white',
    badge: 'bg-white/20 text-white',
    border: 'border-white/20',
  },
  cloudy: {
    bg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800',
    text: 'text-white',
    badge: 'bg-white/15 text-white',
    border: 'border-white/20',
  },
  rainy: {
    bg: 'bg-gradient-to-br from-cyan-800 via-slate-800 to-blue-950',
    text: 'text-white',
    badge: 'bg-cyan-500/25 text-cyan-100',
    border: 'border-cyan-400/30',
  },
  storm: {
    bg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950',
    text: 'text-white',
    badge: 'bg-purple-500/30 text-purple-200',
    border: 'border-purple-400/40',
  },
  night: {
    bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950',
    text: 'text-white',
    badge: 'bg-indigo-500/20 text-indigo-200',
    border: 'border-indigo-400/30',
  },
};

export const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (query: string = 'auto:ip') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Falha ao carregar clima');
      const data = await res.json();
      setWeather(data);
    } catch {
      // Fallback query Brasilia
      try {
        const fb = await fetch('/api/weather?q=Brasilia');
        if (fb.ok) {
          const data = await fb.json();
          setWeather(data);
        }
      } catch (e: any) {
        setError('Previsão indisponível no momento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try user browser geolocation first, then IP lookup
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const query = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
          fetchWeather(query);
        },
        () => {
          fetchWeather('auto:ip');
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        fetchWeather('auto:ip');
      }, 0);
    }
  }, []);

  if (isLoading && !weather) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-12 bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="h-3 w-32 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const currentTheme = THEME_STYLES[weather.theme] || THEME_STYLES.partly_cloudy;

  return (
    <div
      className={`rounded-2xl p-5 shadow-lg border transition-all duration-300 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} relative overflow-hidden`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with City & Local Time */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 shrink-0 text-white/90" />
          <span className="font-extrabold text-sm truncate tracking-tight">
            {weather.location.name}
            {weather.location.region ? `, ${weather.location.region}` : ''}
          </span>
        </div>

        <button
          onClick={() => fetchWeather('auto:ip')}
          className="p-1 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
          title="Atualizar Clima da Cidade"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-sans tracking-tighter">
            {weather.current.tempC}°
          </span>
          <span className="text-xs font-semibold opacity-90">C</span>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold leading-tight">{weather.current.condition}</p>
          <p className="text-[11px] opacity-80 mt-0.5">
            Sensação {weather.current.feelsLikeC}°C
          </p>
        </div>
      </div>

      {/* Daily Min/Max Forecast Bar */}
      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/15 backdrop-blur-sm mb-3.5 border border-white/10">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-white/80" />
          <span>
            Máx: <strong>{weather.forecast.maxTempC}°C</strong>
          </span>
        </div>
        <span className="opacity-40">•</span>
        <div>
          <span>
            Mín: <strong>{weather.forecast.minTempC}°C</strong>
          </span>
        </div>
        <span className="opacity-40">•</span>
        <div className="flex items-center gap-1">
          <Umbrella className="w-3.5 h-3.5 text-cyan-200" />
          <span>{weather.forecast.chanceOfRain}% chuva</span>
        </div>
      </div>

      {/* Meteorological Indices Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Humidity */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <Droplets className="w-4 h-4 text-cyan-200 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-75">Umidade</p>
            <p className="font-extrabold">{weather.current.humidity}%</p>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <Wind className="w-4 h-4 text-white/90 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-75">Vento</p>
            <p className="font-extrabold">
              {weather.current.windKph} km/h {weather.current.windDir}
            </p>
          </div>
        </div>

        {/* UV Index */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <Sun className="w-4 h-4 text-amber-200 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-75">Índice UV</p>
            <p className="font-extrabold">
              {weather.current.uv} ({weather.current.uvLabel})
            </p>
          </div>
        </div>

        {/* Theme Status */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <Sparkles className="w-4 h-4 text-yellow-200 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-75">Clima Atual</p>
            <p className="font-extrabold capitalize">
              {weather.theme.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
