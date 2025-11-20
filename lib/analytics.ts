export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

type EventOptions = {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

export const fbEvent = (name: string, options: EventOptions = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};

export const googleEvent = (action: string, options: EventOptions = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, options);
  }
};

export const trackConversion = (
  eventName: string,
  options: EventOptions = {}
) => {
  fbEvent(eventName, options);
  googleEvent(eventName, options);
  console.log(`✅ [Analytics] ${eventName} disparado.`);
};
