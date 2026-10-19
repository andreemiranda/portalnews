'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/cover.png';

/**
 * Detecta fontes ou domínios que possuem bloqueio contra o proxy otimizador de imagens do Next.js
 * (ex: proteção Cloudflare 403 / anti-scraping da Gazeta Esportiva).
 * Para essas fontes, utiliza-se a incorporação direta (unoptimized: true) com link direto da imagem
 * sem passar pelo servidor Next.js.
 * Para as demais fontes normais (G1, CNN, Exame, etc.), mantém-se a otimização nativa do Next.js.
 */
export function hasNextImageOptimizationBlock(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  return lower.includes('gazetaesportiva.com');
}

export function isInvalidImageString(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('placeholder') ||
    lower.includes('data:image') ||
    lower.includes('pixel') ||
    lower.includes('1x1')
  );
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  fill = true,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fallbackSrc = DEFAULT_FALLBACK,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [prevSrc, setPrevSrc] = useState<string | undefined>(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  const cleanSrc = src && src.trim().length > 0 && !isInvalidImageString(src) ? src.trim() : '';
  const finalSrc = hasError || !cleanSrc ? (fallbackSrc || DEFAULT_FALLBACK) : cleanSrc;

  // Para fontes com bloqueio no otimizador Next.js: incorporação normal mediante link direto (unoptimized: true)
  // Para fontes normais sem bloqueio: mantém o modo otimizado de incorporação de imagens do Next.js (unoptimized: false)
  const isDirectLink = hasNextImageOptimizationBlock(cleanSrc);

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
      <Image
        src={finalSrc}
        alt={alt || 'Imagem de Notícia - Portal News'}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        referrerPolicy="no-referrer"
        unoptimized={isDirectLink}
        onError={handleImageError}
        className={`object-cover transition-all duration-700 ${className}`}
        itemProp="image"
      />
    </div>
  );
};
