/**
 * Base Adapter - Interface e classe base para adapters de integração
 */

import type { IAdapter, AdapterConfig, TrackingEvent, PageInfo } from '../types/events';

/**
 * Classe base abstrata para adapters
 */
export abstract class BaseAdapter implements IAdapter {
  public abstract name: string;
  protected config: AdapterConfig | null = null;

  /**
   * Verifica se o adapter está disponível no ambiente atual
   */
  abstract isAvailable(): boolean;

  /**
   * Inicializa o adapter com configuração
   */
  abstract initialize(config: AdapterConfig): void;

  /**
   * Rastreia um evento
   */
  abstract track(event: TrackingEvent): void;

  /**
   * Rastreia visualização de página (opcional)
   */
  pageview?(page: PageInfo): void;
}

