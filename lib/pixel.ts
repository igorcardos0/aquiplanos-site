// lib/pixel.ts

// Meta Pixel ID - Usa variável de ambiente ou fallback
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1176726867445215";

// 1. Função para rastrear apenas a Visualização de Página
export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

// 2. Função para rastrear eventos personalizados (como Lead)
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};

// 3. Função para carregar o script base do Pixel (roda uma única vez)
export const initPixel = () => {
  if (typeof window === "undefined" || (window as any).fbq) return;

  // Script de inicialização do Meta Pixel
  (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
    undefined,
    undefined,
    undefined
  );

  // Inicializa o Pixel com o ID
  (window as any).fbq("init", FB_PIXEL_ID);
};

// Declaração de tipo global para o TypeScript não reclamar do window.fbq
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}
