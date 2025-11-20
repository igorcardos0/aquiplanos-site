/**
 * Google Analytics 4 Adapter
 * Converte eventos normalizados para formato GA4
 */

import { BaseAdapter } from './base-adapter';
import type { AdapterConfig, TrackingEvent, PageInfo } from '../types/events';

/**
 * Mapeamento de eventos padrão para eventos GA4
 */
const EVENT_MAPPING: Record<string, string> = {
  page_view: 'page_view',
  form_submit: 'form_submit',
  form_start: 'form_start',
  click: 'click',
  scroll: 'scroll',
  time_on_page: 'time_on_page',
  external_link: 'click',
  download: 'file_download',
  video_play: 'video_start',
  video_complete: 'video_complete',
};

export class GoogleAnalyticsAdapter extends BaseAdapter {
  public name = 'googleAnalytics';
  private measurementId: string | null = null;

  /**
   * Verifica se o Google Analytics está disponível
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
  }

  /**
   * Inicializa o adapter
   */
  initialize(config: AdapterConfig & { measurementId?: string }): void {
    this.config = config;
    this.measurementId = config.measurementId || null;

    if (!this.measurementId) {
      console.warn('⚠️ Google Analytics Measurement ID não configurado');
    }
  }

  /**
   * Rastreia um evento
   */
  track(event: TrackingEvent): void {
    if (!this.isAvailable() || !this.config?.enabled) {
      return;
    }

    const gtag = (window as any).gtag;

    // Mapeia o tipo de evento para evento GA4
    const gaEventName = EVENT_MAPPING[event.type] || event.name || 'custom_event';

    // Prepara parâmetros do evento
    const parameters: Record<string, any> = {
      event_category: event.category || 'general',
      event_label: event.label,
      value: event.value,
    };

    // Adiciona propriedades customizadas
    if (event.properties) {
      Object.assign(parameters, event.properties);
    }

    // Adiciona metadados relevantes
    if (event.metadata) {
      if (event.metadata.element_id) {
        parameters.element_id = event.metadata.element_id;
      }
      if (event.metadata.element_text) {
        parameters.element_text = event.metadata.element_text;
      }
      if (event.metadata.scroll_depth) {
        parameters.scroll_depth = event.metadata.scroll_depth;
      }
      if (event.metadata.time_on_page) {
        parameters.time_on_page = event.metadata.time_on_page;
      }
      if (event.metadata.link_url) {
        parameters.link_url = event.metadata.link_url;
      }
    }

    // Para eventos de clique em links externos
    if (event.type === 'external_link' && event.metadata?.link_url) {
      parameters.outbound = true;
      parameters.link_url = event.metadata.link_url;
    }

    // Remove valores undefined/null
    Object.keys(parameters).forEach((key) => {
      if (parameters[key] === undefined || parameters[key] === null) {
        delete parameters[key];
      }
    });

    // Envia evento para GA4
    try {
      gtag('event', gaEventName, parameters);
    } catch (error) {
      console.error('❌ Erro ao enviar evento para Google Analytics:', error);
    }
  }

  /**
   * Rastreia visualização de página
   */
  pageview(page: PageInfo): void {
    if (!this.isAvailable() || !this.config?.enabled || !this.measurementId) {
      return;
    }

    const gtag = (window as any).gtag;
    try {
      gtag('config', this.measurementId, {
        page_path: page.path,
        page_title: page.title,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar PageView para Google Analytics:', error);
    }
  }
}

