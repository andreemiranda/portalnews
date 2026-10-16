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

// Detect hosts that block server-side image fetching (Cloudflare 403 / anti-bot)
export function isForbiddenImageHost(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('gazetaesportiva.com') ||
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
  const [attemptLevel, setAttemptLevel] = useState<number>(0);
  const [prevSrc, setPrevSrc] = useState<string | undefined>(src);

  // When src prop changes, reset error attempt level during render
  if (src !== prevSrc) {
    setPrevSrc(src);
    setAttemptLevel(0);
  }

  // Filter out any known forbidden host before passing to Next.js image optimizer
  const safeSrc =
    src && src.trim().length > 0 && !isForbiddenImageHost(src)
      ? src.trim()
      : (fallbackSrc || DEFAULT_FALLBACK);

  // Progressive resilience:
  // attemptLevel 0: Next.js image optimizer with safe URL
  // attemptLevel >= 1: Verified local portal cover asset
  const finalSrc = attemptLevel >= 1 ? (fallbackSrc || DEFAULT_FALLBACK) : safeSrc;

  const handleImageError = () => {
    setAttemptLevel((prev) => prev + 1);
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
        onError={handleImageError}
        className={`object-cover transition-all duration-700 ${className}`}
        itemProp="image"
      />
    </div>
  );
};
