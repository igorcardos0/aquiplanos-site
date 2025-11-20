/**
 * Meta Pixel Adapter
 * Converte eventos normalizados para formato Meta Pixel
 */

import { BaseAdapter } from './base-adapter';
import type { AdapterConfig, TrackingEvent, PageInfo } from '../types/events';

/**
 * Mapeamento de eventos padrão para eventos Meta Pixel
 */
const EVENT_MAPPING: Record<string, string> = {
  page_view: 'PageView',
  form_submit: 'Lead',
  form_start: 'InitiateCheckout',
  click: 'ViewContent',
  scroll: 'Scroll',
  time_on_page: 'TimeOnPage',
  external_link: 'OutboundClick',
  download: 'Download',
  video_play: 'VideoPlay',
  video_complete: 'VideoComplete',
};

export class MetaPixelAdapter extends BaseAdapter {
  public name = 'metaPixel';
  private pixelId: string | null = null;

  /**
   * Verifica se o Meta Pixel está disponível
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).fbq === 'function';
  }

  /**
   * Inicializa o adapter
   */
  initialize(config: AdapterConfig & { pixelId?: string }): void {
    this.config = config;
    this.pixelId = config.pixelId || null;

    if (!this.pixelId) {
      console.warn('⚠️ Meta Pixel ID não configurado');
    }
  }

  /**
   * Rastreia um evento
   */
  track(event: TrackingEvent): void {
    if (!this.isAvailable() || !this.config?.enabled) {
      return;
    }

    const fbq = (window as any).fbq;

    // Mapeia o tipo de evento para evento Meta Pixel
    const metaEventName = EVENT_MAPPING[event.type] || event.name || 'CustomEvent';

    // Prepara parâmetros do evento
    const parameters: Record<string, any> = {
      content_name: event.name,
      content_category: event.category,
      content_ids: [event.id],
      value: event.value,
      currency: 'BRL',
    };

    // Adiciona propriedades customizadas
    if (event.properties) {
      Object.assign(parameters, event.properties);
    }

    // Adiciona metadados relevantes
    if (event.metadata) {
      if (event.metadata.element_text) {
        parameters.content_name = event.metadata.element_text;
      }
      if (event.metadata.scroll_depth) {
        parameters.scroll_depth = event.metadata.scroll_depth;
      }
      if (event.metadata.time_on_page) {
        parameters.time_on_page = event.metadata.time_on_page;
      }
    }

    // Remove valores undefined/null
    Object.keys(parameters).forEach((key) => {
      if (parameters[key] === undefined || parameters[key] === null) {
        delete parameters[key];
      }
    });

    // Envia evento para Meta Pixel
    try {
      fbq('track', metaEventName, parameters);
    } catch (error) {
      console.error('❌ Erro ao enviar evento para Meta Pixel:', error);
    }
  }

  /**
   * Rastreia visualização de página
   */
  pageview(page: PageInfo): void {
    if (!this.isAvailable() || !this.config?.enabled) {
      return;
    }

    const fbq = (window as any).fbq;
    try {
      fbq('track', 'PageView');
    } catch (error) {
      console.error('❌ Erro ao enviar PageView para Meta Pixel:', error);
    }
  }
}

