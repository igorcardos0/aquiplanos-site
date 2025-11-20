/**
 * Google Ads Adapter
 * Converte eventos normalizados para formato Google Ads Conversion Tracking
 */

import { BaseAdapter } from './base-adapter';
import type { AdapterConfig, TrackingEvent, PageInfo } from '../types/events';

/**
 * Mapeamento de eventos para conversões do Google Ads
 * Configurar no Google Ads quais eventos são conversões
 */
const CONVERSION_EVENTS: Set<string> = new Set([
  'form_submit',
  'purchase',
  'signup',
  'lead',
]);

export class GoogleAdsAdapter extends BaseAdapter {
  public name = 'googleAds';
  private conversionId: string | null = null;
  private conversionLabel: string | null = null;

  /**
   * Verifica se o Google Ads está disponível
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
  }

  /**
   * Inicializa o adapter
   */
  initialize(config: AdapterConfig & { conversionId?: string; conversionLabel?: string }): void {
    this.config = config;
    this.conversionId = config.conversionId || null;
    this.conversionLabel = config.conversionLabel || null;

    if (!this.conversionId || !this.conversionLabel) {
      console.warn('⚠️ Google Ads Conversion ID ou Label não configurados');
    }
  }

  /**
   * Rastreia um evento
   */
  track(event: TrackingEvent): void {
    if (!this.isAvailable() || !this.config?.enabled) {
      return;
    }

    // Google Ads geralmente rastreia apenas eventos de conversão
    if (!CONVERSION_EVENTS.has(event.type) && event.category !== 'conversion') {
      return;
    }

    if (!this.conversionId || !this.conversionLabel) {
      return;
    }

    const gtag = (window as any).gtag;

    // Prepara parâmetros da conversão
    const parameters: Record<string, any> = {
      send_to: `${this.conversionId}/${this.conversionLabel}`,
      value: event.value || 0,
      currency: 'BRL',
    };

    // Adiciona informações adicionais se disponíveis
    if (event.properties) {
      if (event.properties.transaction_id) {
        parameters.transaction_id = event.properties.transaction_id;
      }
    }

    // Envia conversão para Google Ads
    try {
      gtag('event', 'conversion', parameters);
    } catch (error) {
      console.error('❌ Erro ao enviar conversão para Google Ads:', error);
    }
  }

  /**
   * Google Ads não usa pageview específico
   */
  pageview(): void {
    // Não implementado - Google Ads foca em conversões
  }
}

