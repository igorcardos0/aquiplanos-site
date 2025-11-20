/**
 * Configuração Centralizada do Sistema de Tracking
 * Centraliza todas as configurações do sistema de rastreamento
 */

import type { TrackingConfig } from './tracking/types/events';

/**
 * Configuração padrão do sistema de tracking
 */
export const trackingConfig: TrackingConfig = {
  // Endpoint da API para enviar eventos
  apiEndpoint: process.env.NEXT_PUBLIC_TRACKING_API_URL || '/api/events',
  
  // API Key para autenticação
  apiKey: process.env.NEXT_PUBLIC_TRACKING_API_KEY || '',
  
  // Habilita/desabilita o tracking
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_TRACKING_ENABLED === 'true',
  
  // Modo debug (logs no console)
  debug: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TRACKING_DEBUG === 'true',
  
  // Configuração dos adapters de integração
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
  
  // Configuração de auto-tracking
  autoTracking: {
    clicks: true,              // Rastreia cliques em botões e links
    forms: true,               // Rastreia início e submissão de formulários
    externalLinks: true,       // Rastreia cliques em links externos
    scroll: true,              // Rastreia profundidade de scroll
    timeOnPage: true,          // Rastreia tempo na página
  },
  
  // Thresholds de scroll (percentuais)
  scrollThresholds: [25, 50, 75, 100],
  
  // Thresholds de tempo (segundos)
  timeThresholds: [10, 30, 60],
  
  // Configuração da fila de eventos
  queueConfig: {
    maxRetries: 5,             // Máximo de tentativas de envio
    retryDelay: 5000,          // Delay entre tentativas (ms)
    batchSize: 10,             // Tamanho do batch de envio
    maxAge: 7,                 // Idade máxima dos eventos na fila (dias)
  },
};

/**
 * Valida se a configuração está completa
 */
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

