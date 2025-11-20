"use client";

/**
 * TrackingProvider - Provider React para o sistema de tracking
 * Substitui/estende o AnalyticsProvider existente
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { initTracker, getTracker } from '@/lib/tracking/core/tracker';
import { trackingConfig } from '@/lib/tracking-config';
import { MetaPixelAdapter } from '@/lib/tracking/adapters/meta-pixel';
import { GoogleAnalyticsAdapter } from '@/lib/tracking/adapters/google-analytics';
import { GoogleAdsAdapter } from '@/lib/tracking/adapters/google-ads';
import { FB_PIXEL_ID, GA_ID } from '@/lib/analytics';

interface TrackingProviderProps {
  children: React.ReactNode;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const trackerRef = useRef<any>(null);

  // Inicializa o tracker uma vez
  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined') {
      return;
    }

    const initializeTracking = async () => {
      try {
        // Cria configuração com IDs do ambiente
        const config = {
          ...trackingConfig,
          adapters: {
            ...trackingConfig.adapters,
            metaPixel: {
              ...trackingConfig.adapters.metaPixel,
              pixelId: FB_PIXEL_ID || trackingConfig.adapters.metaPixel?.pixelId || '',
            },
            googleAnalytics: {
              ...trackingConfig.adapters.googleAnalytics,
              measurementId: GA_ID || trackingConfig.adapters.googleAnalytics?.measurementId || '',
            },
          },
        };

        // Inicializa tracker
        const tracker = await initTracker(config);
        trackerRef.current = tracker;

        // Registra adapters
        if (config.adapters.metaPixel?.enabled && FB_PIXEL_ID) {
          tracker.registerAdapter(new MetaPixelAdapter());
        }

        if (config.adapters.googleAnalytics?.enabled && GA_ID) {
          tracker.registerAdapter(new GoogleAnalyticsAdapter());
        }

        if (config.adapters.googleAds?.enabled) {
          tracker.registerAdapter(new GoogleAdsAdapter());
        }

        initializedRef.current = true;

        if (config.debug) {
          console.log('✅ Sistema de Tracking inicializado');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar tracking:', error);
      }
    };

    initializeTracking();
  }, []);

  // Rastreia mudanças de página
  useEffect(() => {
    if (!initializedRef.current || !trackerRef.current) {
      return;
    }

    // Pequeno delay para garantir que a página carregou
    const timer = setTimeout(() => {
      trackerRef.current?.pageview({
        path: pathname,
        title: document.title,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {children}

      {/* Scripts de terceiros (mantém compatibilidade com código existente) */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

