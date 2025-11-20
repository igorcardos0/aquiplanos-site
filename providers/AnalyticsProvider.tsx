"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { FB_PIXEL_ID, GA_ID, fbEvent, googleEvent } from "@/lib/analytics";

function AnalyticsContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);

  // 1. Rastreamento de PageView (Mudança de Rota)
  useEffect(() => {
    // Verifica se o FBQ já existe (carregado pelo script abaixo)
    // Só executa no cliente após a hidratação
    if (loaded && typeof window !== "undefined") {
      console.log(`📊 PageView disparado em: ${pathname}`);
      fbEvent("PageView");
      
      if (typeof window !== "undefined" && window.gtag && GA_ID) {
         window.gtag("config", GA_ID, { page_path: pathname });
      }
    }
  }, [pathname, searchParams, loaded]);

  // 2. Timer de Engajamento (10s e 30s)
  useEffect(() => {
    // Só executa no cliente após a hidratação
    if (!loaded || typeof window === "undefined") return;

    const timer10 = setTimeout(() => {
      console.log("⏰ Usuário ficou 10s na página");
      fbEvent("CustomEvent", { event_name: "TimeOnPage_10s", seconds: 10 });
      googleEvent("time_on_page", { event_category: "Engagement", value: 10 });
    }, 10000);

    const timer30 = setTimeout(() => {
      console.log("🔥 Usuário ficou 30s na página");
      fbEvent("CustomEvent", { event_name: "TimeOnPage_30s", seconds: 30 });
      googleEvent("time_on_page", { event_category: "Engagement", value: 30 });
    }, 30000);

    return () => {
      clearTimeout(timer10);
      clearTimeout(timer30);
    };
  }, [pathname, loaded]);

  return (
    <>
      {children}

      {/* GOOGLE ANALYTICS 4 */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              (function() {
                if (typeof window === 'undefined') return;
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              })();
            `}
          </Script>
        </>
      )}

      {/* FACEBOOK PIXEL (MÉTODO CLÁSSICO DE INJEÇÃO) */}
      {/* Isso garante que o 'fbq' é criado ANTES do arquivo fbevents.js baixar */}
      {/* Desabilita em localhost para evitar avisos de permissão */}
      {FB_PIXEL_ID && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                
                // Desabilita Meta Pixel em localhost para evitar avisos de permissão
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  console.log('⚠️ Meta Pixel desabilitado em localhost (normal - funciona apenas em produção)');
                  return;
                }
                
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                if (typeof window !== 'undefined' && window.fbq) {
                  fbq('init', '${FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                }
              })();
            `,
            }}
            onLoad={() => {
              // Marca como carregado para ativar os efeitos do useEffect
              // Só marca se estiver no cliente
              if (typeof window !== "undefined") {
                setLoaded(true);
                console.log("✅ Pixel do Facebook Iniciado (Método Injeção)");
              }
            }}
          />
      )}
    </>
  );
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <AnalyticsContent>{children}</AnalyticsContent>
    </Suspense>
  );
}