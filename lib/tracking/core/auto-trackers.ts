/**
 * Auto Trackers - Detectores automáticos de eventos
 * Monitora interações do usuário sem necessidade de código manual
 */

import { normalizeClickEvent, normalizeFormEvent, normalizeScrollEvent, normalizeTimeEvent } from './event-normalizer';
import type { TrackingConfig } from '../types/events';

export class AutoTrackers {
  private config: TrackingConfig;
  private scrollTracked: Set<number> = new Set();
  private timeTracked: Set<number> = new Set();
  private scrollHandler: (() => void) | null = null;
  private timeHandlers: NodeJS.Timeout[] = [];
  private visibilityHandler: (() => void) | null = null;
  private isPageVisible: boolean = true;
  private pageStartTime: number = Date.now();
  private accumulatedTime: number = 0;
  private lastActiveTime: number = Date.now();

  constructor(config: TrackingConfig) {
    this.config = config;
    this.init();
  }

  /**
   * Inicializa todos os auto-trackers configurados
   */
  private init(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.config.autoTracking.clicks) {
      this.initClickTracker();
    }

    if (this.config.autoTracking.forms) {
      this.initFormTracker();
    }

    if (this.config.autoTracking.externalLinks) {
      // Links externos são tratados no click tracker
    }

    if (this.config.autoTracking.scroll) {
      this.initScrollTracker();
    }

    if (this.config.autoTracking.timeOnPage) {
      this.initTimeTracker();
    }

    // Rastreia visibilidade da página (pausa timer quando aba está inativa)
    this.initVisibilityTracker();
  }

  /**
   * Inicializa o tracker de cliques
   */
  private initClickTracker(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Ignora elementos com data-track-ignore
      if (target.closest('[data-track-ignore]')) {
        return;
      }

      // Encontra o elemento clicável mais próximo
      const clickableElement = this.findClickableElement(target);

      if (!clickableElement) {
        return;
      }

      // Verifica se é um link externo
      if (clickableElement.tagName === 'A') {
        const link = clickableElement as HTMLAnchorElement;
        try {
          const url = new URL(link.href);
          if (url.hostname !== window.location.hostname && this.config.autoTracking.externalLinks) {
            // Link externo será tratado no normalizeClickEvent
          }
        } catch (e) {
          // URL inválida, ignora
        }
      }

      // Cria evento normalizado
      const trackingEvent = normalizeClickEvent(clickableElement, {
        category: 'interaction',
      });

      // Dispara evento customizado para o tracker principal capturar
      window.dispatchEvent(
        new CustomEvent('tracking:auto-event', {
          detail: trackingEvent,
        })
      );
    });
  }

  /**
   * Encontra o elemento clicável mais próximo
   */
  private findClickableElement(element: HTMLElement): HTMLElement | null {
    // Elementos clicáveis diretos
    const clickableTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (clickableTags.includes(element.tagName)) {
      return element;
    }

    // Procura por elementos com data-track
    const trackedElement = element.closest('[data-track]');
    if (trackedElement) {
      return trackedElement as HTMLElement;
    }

    // Procura por botões ou links próximos
    const button = element.closest('button, a, [role="button"]');
    if (button) {
      return button as HTMLElement;
    }

    return null;
  }

  /**
   * Inicializa o tracker de formulários
   */
  private initFormTracker(): void {
    // Rastreia início de preenchimento (focus no primeiro campo)
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const form = target.closest('form');

      if (form && !form.hasAttribute('data-tracked-start')) {
        form.setAttribute('data-tracked-start', 'true');

        const trackingEvent = normalizeFormEvent(form, 'form_start', {
          category: 'form',
        });

        window.dispatchEvent(
          new CustomEvent('tracking:auto-event', {
            detail: trackingEvent,
          })
        );
      }
    });

    // Rastreia submissão de formulários
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;

      if (form.tagName === 'FORM') {
        const trackingEvent = normalizeFormEvent(form, 'form_submit', {
          category: 'conversion',
          value: 1,
        });

        window.dispatchEvent(
          new CustomEvent('tracking:auto-event', {
            detail: trackingEvent,
          })
        );
      }
    });
  }

  /**
   * Inicializa o tracker de scroll
   */
  private initScrollTracker(): void {
    this.scrollHandler = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Verifica cada threshold configurado
      this.config.scrollThresholds.forEach((threshold) => {
        if (scrollPercentage >= threshold && !this.scrollTracked.has(threshold)) {
          this.scrollTracked.add(threshold);

          const trackingEvent = normalizeScrollEvent(threshold, {
            category: 'engagement',
          });

          window.dispatchEvent(
            new CustomEvent('tracking:auto-event', {
              detail: trackingEvent,
            })
          );
        }
      });
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /**
   * Inicializa o tracker de tempo na página
   */
  private initTimeTracker(): void {
    this.pageStartTime = Date.now();
    this.lastActiveTime = Date.now();

    // Cria timers para cada threshold configurado
    this.config.timeThresholds.forEach((threshold) => {
      const handler = setTimeout(() => {
        if (this.isPageVisible && !this.timeTracked.has(threshold)) {
          this.timeTracked.add(threshold);

          const trackingEvent = normalizeTimeEvent(threshold, {
            category: 'engagement',
          });

          window.dispatchEvent(
            new CustomEvent('tracking:auto-event', {
              detail: trackingEvent,
            })
          );
        }
      }, threshold * 1000);

      this.timeHandlers.push(handler);
    });
  }

  /**
   * Inicializa o tracker de visibilidade da página
   */
  private initVisibilityTracker(): void {
    this.visibilityHandler = () => {
      if (document.hidden) {
        // Página ficou oculta - salva tempo acumulado
        this.accumulatedTime += Date.now() - this.lastActiveTime;
        this.isPageVisible = false;
      } else {
        // Página ficou visível - reinicia contador
        this.lastActiveTime = Date.now();
        this.isPageVisible = true;
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Reseta os trackers (útil ao mudar de página em SPA)
   */
  reset(): void {
    this.scrollTracked.clear();
    this.timeTracked.clear();
    this.pageStartTime = Date.now();
    this.lastActiveTime = Date.now();
    this.accumulatedTime = 0;
    this.isPageVisible = !document.hidden;
  }

  /**
   * Limpa todos os listeners
   */
  destroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    this.timeHandlers.forEach((handler) => clearTimeout(handler));
    this.timeHandlers = [];

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}

