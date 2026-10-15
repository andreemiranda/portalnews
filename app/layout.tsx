import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { SITE_CONFIG, getBaseUrl } from '@/lib/site-config';
import { generatePortalOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

const currentDomain = getBaseUrl();

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(currentDomain),
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
    url: currentDomain,
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
    canonical: currentDomain,
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
  const orgSchema = generatePortalOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const adsenseClientId = SITE_CONFIG.adsense.clientId;

  // Extrai dinamicamente a origem da URL base para tags DNS Prefetch / Preconnect
  let apiOrigin = currentDomain;
  try {
    apiOrigin = new URL(currentDomain).origin;
  } catch {
    apiOrigin = currentDomain;
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch e Preconnect dinâmicos automáticos conforme variáveis de domínio do código */}
        <link rel="dns-prefetch" href={apiOrigin} />
        <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google AdSense Script */}
        {adsenseClientId && (
          <Script
            id="google-adsense"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Structured Data JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />

        {/* Global Theme & Accessibility Initializer */}
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('portal_theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                  var fs = localStorage.getItem('portal_font_size') || 'normal';
                  document.documentElement.setAttribute('data-font-size', fs);
                } catch (e) {}
              })();
            `,
          }}
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
      <body suppressHydrationWarning className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
