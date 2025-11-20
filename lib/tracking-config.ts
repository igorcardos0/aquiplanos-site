import type { TrackingConfig } from './tracking/types/events';

export const trackingConfig: TrackingConfig = {
  apiEndpoint: process.env.NEXT_PUBLIC_TRACKING_API_URL || '/api/events',
  apiKey: process.env.NEXT_PUBLIC_TRACKING_API_KEY || '',
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_TRACKING_ENABLED === 'true',
  debug: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TRACKING_DEBUG === 'true',
  
  adapters: {
    metaPixel: {
      enabled: !!process.env.NEXT_PUBLIC_FB_PIXEL_ID,
      pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
    },
    googleAnalytics: {
      enabled: !!process.env.NEXT_PUBLIC_GA_ID,
      measurementId: process.env.NEXT_PUBLIC_GA_ID || '',
    },
    googleAds: {
      enabled: !!process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && !!process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL,
      conversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '',
      conversionLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL || '',
    },
  },
  
  autoTracking: {
    clicks: true,
    forms: true,
    externalLinks: true,
    scroll: true,
    timeOnPage: true,
  },
  
  scrollThresholds: [25, 50, 75, 100],
  timeThresholds: [10, 30, 60],
  
  queueConfig: {
    maxRetries: 5,
    retryDelay: 5000,
    batchSize: 10,
    maxAge: 7,
  },
};

export function validateConfig(config: TrackingConfig): boolean {
  if (!config.apiEndpoint) {
    console.warn('⚠️ API endpoint não configurado');
    return false;
  }

  if (!config.apiKey) {
    console.warn('⚠️ API key não configurada');
    return false;
  }

  return true;
}

