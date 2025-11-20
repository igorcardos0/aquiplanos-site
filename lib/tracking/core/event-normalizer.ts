/**
 * Normalizador de Eventos
 * Converte eventos brutos em formato padronizado TrackingEvent
 */

import type { TrackingEvent, EventType, PageInfo, UserInfo, EventMetadata } from '../types/events';

/**
 * Gera um ID único para o evento
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtém informações da página atual
 */
function getPageInfo(): PageInfo {
  if (typeof window === 'undefined') {
    return {
      url: '',
      path: '',
      title: '',
    };
  }

  return {
    url: window.location.href,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer || undefined,
    search: window.location.search || undefined,
    hash: window.location.hash || undefined,
  };
}

/**
 * Obtém informações do usuário/sessão
 */
function getUserInfo(): UserInfo {
  if (typeof window === 'undefined') {
    return {
      session_id: '',
      user_agent: '',
    };
  }

  // Gera ou recupera session_id
  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tracking_session_id', sessionId);
  }

  return {
    session_id: sessionId,
    user_agent: navigator.userAgent,
    language: navigator.language,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Normaliza um evento para o formato padrão
 */
export function normalizeEvent(
  type: EventType,
  name: string,
  options: {
    category?: string;
    label?: string;
    value?: number;
    properties?: Record<string, any>;
    metadata?: EventMetadata;
  } = {}
): TrackingEvent {
  const {
    category,
    label,
    value,
    properties = {},
    metadata = {},
  } = options;

  return {
    id: generateEventId(),
    type,
    name,
    category,
    label,
    value,
    properties,
    timestamp: Date.now(),
    page: getPageInfo(),
    user: getUserInfo(),
    metadata,
  };
}

/**
 * Normaliza um evento de clique
 */
export function normalizeClickEvent(
  element: HTMLElement,
  options: {
    category?: string;
    label?: string;
    value?: number;
  } = {}
): TrackingEvent {
  const metadata: EventMetadata = {
    element_id: element.id || undefined,
    element_class: element.className || undefined,
    element_tag: element.tagName.toLowerCase(),
    element_text: element.textContent?.trim().substring(0, 100) || undefined,
  };

  // Se for um link, adiciona href
  if (element.tagName === 'A') {
    const link = element as HTMLAnchorElement;
    metadata.element_href = link.href;
    
    // Detecta se é link externo
    try {
      const url = new URL(link.href);
      if (url.hostname !== window.location.hostname) {
        metadata.link_domain = url.hostname;
        return normalizeEvent('external_link', 'external_link_click', {
          ...options,
          label: link.href,
          metadata,
        });
      }
    } catch (e) {
      // URL inválida, ignora
    }
  }

  return normalizeEvent('click', 'button_click', {
    ...options,
    label: metadata.element_text || metadata.element_id || 'unknown',
    metadata,
  });
}

/**
 * Normaliza um evento de formulário
 */
export function normalizeFormEvent(
  form: HTMLFormElement,
  eventType: 'form_start' | 'form_submit',
  options: {
    category?: string;
    label?: string;
    value?: number;
  } = {}
): TrackingEvent {
  const formData = new FormData(form);
  const formFields: Record<string, any> = {};

  // Coleta nomes dos campos preenchidos (sem valores sensíveis)
  formData.forEach((value, key) => {
    // Não armazena valores de campos sensíveis
    const sensitiveFields = ['password', 'credit', 'card', 'cvv', 'ssn'];
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field)
    );

    if (!isSensitive) {
      formFields[key] = value.toString().length > 0 ? '[filled]' : '[empty]';
    } else {
      formFields[key] = '[hidden]';
    }
  });

  const metadata: EventMetadata = {
    form_id: form.id || undefined,
    form_fields: formFields,
    element_id: form.id || undefined,
    element_class: form.className || undefined,
  };

  return normalizeEvent(eventType, `${eventType}_event`, {
    ...options,
    label: form.id || 'form',
    metadata,
  });
}

/**
 * Normaliza um evento de scroll
 */
export function normalizeScrollEvent(
  depth: number,
  options: {
    category?: string;
    label?: string;
  } = {}
): TrackingEvent {
  return normalizeEvent('scroll', 'scroll_depth', {
    ...options,
    label: `${depth}%`,
    value: depth,
    metadata: {
      scroll_depth: depth,
    },
  });
}

/**
 * Normaliza um evento de tempo na página
 */
export function normalizeTimeEvent(
  seconds: number,
  options: {
    category?: string;
    label?: string;
  } = {}
): TrackingEvent {
  return normalizeEvent('time_on_page', 'time_on_page', {
    ...options,
    label: `${seconds}s`,
    value: seconds,
    metadata: {
      time_on_page: seconds,
    },
  });
}

/**
 * Normaliza um evento de visualização de página
 */
export function normalizePageViewEvent(
  options: {
    category?: string;
    label?: string;
  } = {}
): TrackingEvent {
  return normalizeEvent('page_view', 'page_view', {
    ...options,
    label: getPageInfo().path,
  });
}

