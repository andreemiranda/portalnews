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

  const rawSrc = (src && src.trim().length > 0) ? src.trim() : (fallbackSrc || DEFAULT_FALLBACK);

  // Progressive resilience:
  // attemptLevel 0: Standard Next.js image proxy
  // attemptLevel 1: Direct unoptimized browser load (bypasses CORS/proxy failure)
  // attemptLevel >= 2: Fallback to verified local portal cover asset
  const isUnoptimized = attemptLevel === 1;
  const finalSrc = attemptLevel >= 2 ? (fallbackSrc || DEFAULT_FALLBACK) : rawSrc;

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
        unoptimized={isUnoptimized}
        onError={handleImageError}
        className={`object-cover transition-all duration-700 ${className}`}
        itemProp="image"
      />
    </div>
  );
};
