/**
 * Tipos TypeScript para o sistema de tracking de eventos
 * Define a estrutura de dados para eventos normalizados
 */

/**
 * Tipos de eventos suportados
 */
export type EventType =
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'form_start'
  | 'scroll'
  | 'time_on_page'
  | 'external_link'
  | 'download'
  | 'video_play'
  | 'video_complete'
  | 'custom';

/**
 * Informações da página onde o evento ocorreu
 */
export interface PageInfo {
  url: string;
  path: string;
  title: string;
  referrer?: string;
  search?: string;
  hash?: string;
}

/**
 * Informações do usuário/sessão
 */
export interface UserInfo {
  session_id: string;
  user_agent: string;
  language?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  timezone?: string;
}

/**
 * Metadados específicos do evento
 */
export interface EventMetadata {
  element_id?: string;
  element_class?: string;
  element_tag?: string;
  element_text?: string;
  element_href?: string;
  scroll_depth?: number;
  time_on_page?: number;
  form_fields?: Record<string, any>;
  form_id?: string;
  link_url?: string;
  link_domain?: string;
  [key: string]: any;
}

/**
 * Evento de tracking normalizado
 */
export interface TrackingEvent {
  id: string;
  type: EventType;
  name: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  page: PageInfo;
  user: UserInfo;
  metadata?: EventMetadata;
}

/**
 * Configuração de um adapter de integração
 */
export interface AdapterConfig {
  enabled: boolean;
  [key: string]: any;
}

/**
 * Interface base para adapters de integração
 */
export interface IAdapter {
  name: string;
  isAvailable(): boolean;
  track(event: TrackingEvent): void;
  initialize(config: AdapterConfig): void;
  pageview?(page: PageInfo): void;
}

/**
 * Configuração do sistema de tracking
 */
export interface TrackingConfig {
  apiEndpoint: string;
  apiKey: string;
  enabled: boolean;
  debug?: boolean;
  adapters: {
    metaPixel?: AdapterConfig & { pixelId?: string };
    googleAnalytics?: AdapterConfig & { measurementId?: string };
    googleAds?: AdapterConfig & { conversionId?: string; conversionLabel?: string };
  };
  autoTracking: {
    clicks: boolean;
    forms: boolean;
    externalLinks: boolean;
    scroll: boolean;
    timeOnPage: boolean;
  };
  scrollThresholds: number[];
  timeThresholds: number[];
  queueConfig: {
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
    maxAge: number; // dias
  };
}

/**
 * Resposta da API ao enviar eventos
 */
export interface ApiResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

/**
 * Estatísticas de eventos
 */
export interface EventStats {
  total_events: number;
  by_type: Record<string, number>;
  by_date: Array<{ date: string; count: number }>;
  by_name: Record<string, number>;
  top_events: Array<{ name: string; count: number }>;
}

