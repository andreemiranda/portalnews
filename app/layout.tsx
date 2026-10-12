import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { SITE_CONFIG } from '@/lib/site-config';

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: 'Portal News | Notícias e Cobertura Completa • Brasil',
    template: '%s | Portal News',
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: 'Redação Portal News' }],
  generator: 'Next.js',
  keywords: [
    'Portal News',
    'Notícias Brasil',
    'Cobertura Completa',
    'Economia',
    'Justiça',
    'Política',
    'Educação',
    'Esporte',
    'Tecnologia',
    'Jornalismo',
  ],
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.svg'],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Portal News | Notícias e Cobertura Completa • Brasil',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/cover.png',
        width: 1200,
        height: 630,
        alt: 'Portal News - Cobertura Jornalística Completa',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal News | Notícias e Cobertura Completa • Brasil',
    description: SITE_CONFIG.description,
    images: ['/cover.png'],
  },
  alternates: {
    canonical: SITE_CONFIG.domain,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/icon-512.png`,
    description: SITE_CONFIG.description,
    sameAs: [],
  };

  const adsenseClientId = SITE_CONFIG.adsense.clientId;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google AdSense Script - loads afterInteractive to prevent hydration mismatch */}
        {adsenseClientId && (
          <Script
            id="google-adsense"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* PWA & Client Chunk Recovery Script */}
        <Script
          id="pwa-chunk-recovery"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function shouldReload(msg) {
                  return typeof msg === 'string' && (
                    msg.indexOf('ChunkLoadError') !== -1 ||
                    msg.indexOf('Loading chunk') !== -1 ||
                    msg.indexOf("Unexpected token '<'") !== -1 ||
                    msg.indexOf('Failed to fetch dynamically imported module') !== -1
                  );
                }
                window.addEventListener('error', function(e) {
                  if (shouldReload(e.message)) {
                    var last = sessionStorage.getItem('chunk_recovery_ts');
                    var now = Date.now();
                    if (!last || now - parseInt(last, 10) > 8000) {
                      sessionStorage.setItem('chunk_recovery_ts', now.toString());
                      window.location.reload();
                    }
                  }
                });
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e.reason && (e.reason.message || e.reason.toString())) || '';
                  if (shouldReload(reason)) {
                    var last = sessionStorage.getItem('chunk_recovery_ts');
                    var now = Date.now();
                    if (!last || now - parseInt(last, 10) > 8000) {
                      sessionStorage.setItem('chunk_recovery_ts', now.toString());
                      window.location.reload();
                    }
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
