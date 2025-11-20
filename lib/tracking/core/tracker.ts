/**
 * Classe Principal do Tracker
 * Coordena todos os componentes do sistema de tracking
 */

import { eventQueue } from './event-queue';
import { normalizeEvent, normalizePageViewEvent } from './event-normalizer';
import { AutoTrackers } from './auto-trackers';
import type { TrackingEvent, TrackingConfig, IAdapter, ApiResponse } from '../types/events';

export class Tracker {
  private config: TrackingConfig;
  private adapters: Map<string, IAdapter> = new Map();
  private autoTrackers: AutoTrackers | null = null;
  private initialized: boolean = false;
  private retryInterval: NodeJS.Timeout | null = null;

  constructor(config: TrackingConfig) {
    this.config = config;
  }

  /**
   * Inicializa o tracker
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ Tracker já inicializado');
      return;
    }

    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('📊 Tracking desabilitado');
      }
      return;
    }

    // Inicializa auto-trackers
    if (typeof window !== 'undefined') {
      this.autoTrackers = new AutoTrackers(this.config);

      // Escuta eventos automáticos
      window.addEventListener('tracking:auto-event', ((event: CustomEvent<TrackingEvent>) => {
        this.trackEvent(event.detail);
      }) as EventListener);

      // Processa fila pendente
      this.processQueue();

      // Inicia retry periódico
      this.startRetryInterval();
    }

    this.initialized = true;

    if (this.config.debug) {
      console.log('✅ Tracker inicializado');
    }
  }

  /**
   * Registra um adapter de integração
   */
  registerAdapter(adapter: IAdapter): void {
    if (adapter.isAvailable()) {
      this.adapters.set(adapter.name, adapter);
      
      // Inicializa adapter com configuração
      const adapterConfig = this.config.adapters[adapter.name as keyof typeof this.config.adapters];
      if (adapterConfig?.enabled) {
        adapter.initialize(adapterConfig);
      }

      if (this.config.debug) {
        console.log(`✅ Adapter registrado: ${adapter.name}`);
      }
    } else {
      if (this.config.debug) {
        console.warn(`⚠️ Adapter não disponível: ${adapter.name}`);
      }
    }
  }

  /**
   * Rastreia um evento manualmente
   */
  track(
    name: string,
    options: {
      type?: string;
      category?: string;
      label?: string;
      value?: number;
      properties?: Record<string, any>;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    if (!this.initialized) {
      console.warn('⚠️ Tracker não inicializado. Chame initialize() primeiro.');
      return;
    }

    const {
      type = 'custom',
      category,
      label,
      value,
      properties = {},
      metadata = {},
    } = options;

    const event = normalizeEvent(
      type as any,
      name,
      {
        category,
        label,
        value,
        properties,
        metadata,
      }
    );

    this.trackEvent(event);
  }

  /**
   * Rastreia visualização de página
   */
  pageview(options: { path?: string; title?: string } = {}): void {
    if (!this.initialized) {
      return;
    }

    const event = normalizePageViewEvent({
      label: options.path || window.location.pathname,
    });

    // Atualiza informações da página se fornecidas
    if (options.path) {
      event.page.path = options.path;
    }
    if (options.title) {
      event.page.title = options.title;
    }

    this.trackEvent(event);

    // Notifica adapters que suportam pageview
    this.adapters.forEach((adapter) => {
      if (adapter.pageview) {
        adapter.pageview(event.page);
      }
    });
  }

  /**
   * Processa um evento (interno)
   */
  private async trackEvent(event: TrackingEvent): Promise<void> {
    // Envia para adapters primeiro (síncrono)
    this.sendToAdapters(event);

    // Adiciona à fila para envio ao backend
    await eventQueue.enqueue(event);

    // Tenta enviar imediatamente
    this.sendToBackend([event]);
  }

  /**
   * Envia evento para adapters de integração
   */
  private sendToAdapters(event: TrackingEvent): void {
    this.adapters.forEach((adapter) => {
      try {
        adapter.track(event);
      } catch (error) {
        console.error(`❌ Erro ao enviar evento para adapter ${adapter.name}:`, error);
      }
    });
  }

  /**
   * Envia eventos para o backend API
   */
  private async sendToBackend(events: TrackingEvent[]): Promise<void> {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      if (this.config.debug) {
        console.warn('⚠️ API endpoint ou key não configurados');
      }
      return;
    }

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          events,
          api_key: this.config.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Remove eventos enviados com sucesso da fila
        events.forEach((event) => {
          eventQueue.dequeue(event.id);
        });

        if (this.config.debug) {
          console.log(`✅ ${result.processed} eventos enviados com sucesso`);
        }
      } else {
        throw new Error(result.errors?.join(', ') || 'Erro desconhecido');
      }
    } catch (error) {
      // Erro ao enviar - eventos permanecem na fila para retry
      events.forEach((event) => {
        eventQueue.incrementAttempts(event.id);
      });

      if (this.config.debug) {
        console.warn('⚠️ Erro ao enviar eventos ao backend:', error);
      }
    }
  }

  /**
   * Processa a fila de eventos pendentes
   */
  private async processQueue(): Promise<void> {
    const queuedEvents = await eventQueue.getReadyForRetry(this.config.queueConfig.maxRetries);

    if (queuedEvents.length === 0) {
      return;
    }

    // Agrupa eventos em batches
    const batchSize = this.config.queueConfig.batchSize;
    for (let i = 0; i < queuedEvents.length; i += batchSize) {
      const batch = queuedEvents.slice(i, i + batchSize);
      const events = batch.map((q) => q.event);

      await this.sendToBackend(events);
    }
  }

  /**
   * Inicia intervalo de retry periódico
   */
  private startRetryInterval(): void {
    if (this.retryInterval) {
      return;
    }

    this.retryInterval = setInterval(() => {
      this.processQueue();
    }, this.config.queueConfig.retryDelay);
  }

  /**
   * Para o intervalo de retry
   */
  private stopRetryInterval(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  /**
   * Reseta o tracker (útil em SPAs ao mudar de página)
   */
  reset(): void {
    if (this.autoTrackers) {
      this.autoTrackers.reset();
    }
  }

  /**
   * Destrói o tracker (limpa listeners e intervalos)
   */
  destroy(): void {
    if (this.autoTrackers) {
      this.autoTrackers.destroy();
    }

    this.stopRetryInterval();

    if (typeof window !== 'undefined') {
      window.removeEventListener('tracking:auto-event', () => {});
    }

    this.initialized = false;
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats(): Promise<{ size: number }> {
    const size = await eventQueue.size();
    return { size };
  }
}

// Instância singleton (será inicializada com configuração)
let trackerInstance: Tracker | null = null;

/**
 * Obtém ou cria a instância do tracker
 */
export function getTracker(config?: TrackingConfig): Tracker {
  if (!trackerInstance && config) {
    trackerInstance = new Tracker(config);
  }

  if (!trackerInstance) {
    throw new Error('Tracker não inicializado. Forneça a configuração primeiro.');
  }

  return trackerInstance;
}

/**
 * Inicializa o tracker com configuração
 */
export async function initTracker(config: TrackingConfig): Promise<Tracker> {
  const tracker = getTracker(config);
  await tracker.initialize();
  return tracker;
}

