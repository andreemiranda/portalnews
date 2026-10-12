'use client';

import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '@/lib/site-config';

interface AdSenseBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot,
  format = 'auto',
  className = '',
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const clientId = SITE_CONFIG.adsense.clientId;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && clientId && slot) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch {
        // AdSense push error ignored
      }
    }, 100);

    return () => {
      cancelAnimationFrame(id);
      clearTimeout(timer);
    };
  }, [clientId, slot]);

  if (!clientId || !slot || !isMounted) {
    return <div className={`min-h-[1px] my-2 ${className}`} suppressHydrationWarning />;
  }

  return (
    <div className={`overflow-hidden text-center my-4 ${className}`} suppressHydrationWarning>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        suppressHydrationWarning
      />
    </div>
  );
};
