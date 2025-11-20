/**
 * Exemplos de Uso do Sistema de Tracking
 * 
 * Este arquivo contém exemplos práticos de como usar o sistema
 */

import { getTracker } from './core/tracker';

// ============================================
// EXEMPLO 1: Tracking Manual Simples
// ============================================

export function exemploTrackingSimples() {
  const tracker = getTracker();

  // Evento básico
  tracker.track('video_play', {
    category: 'engagement',
    label: 'hero_video',
    value: 100,
  });
}

// ============================================
// EXEMPLO 2: Tracking de Conversão
// ============================================

export function exemploTrackingConversao() {
  const tracker = getTracker();

  // Quando formulário é submetido com sucesso
  tracker.track('lead_conversion', {
    category: 'conversion',
    label: 'form_submit',
    value: 1,
    properties: {
      form_type: 'cotacao',
      source: 'homepage',
    },
  });
}

// ============================================
// EXEMPLO 3: Tracking de Interação
// ============================================

export function exemploTrackingInteracao(elemento: HTMLElement) {
  const tracker = getTracker();

  // Rastrear clique específico
  elemento.addEventListener('click', () => {
    tracker.track('cta_click', {
      category: 'interaction',
      label: elemento.id || elemento.textContent?.substring(0, 50),
      properties: {
        button_id: elemento.id,
        button_text: elemento.textContent?.trim(),
        section: elemento.closest('section')?.id,
      },
    });
  });
}

// ============================================
// EXEMPLO 4: Tracking de Formulário Customizado
// ============================================

export function exemploTrackingFormulario(form: HTMLFormElement) {
  const tracker = getTracker();

  // Rastrear início de preenchimento
  form.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      tracker.track('form_field_focus', {
        category: 'form',
        label: target.name || 'unknown',
        properties: {
          field_name: target.name,
          field_type: (target as HTMLInputElement).type,
          form_id: form.id,
        },
      });
    }
  });

  // Rastrear submissão
  form.addEventListener('submit', () => {
    tracker.track('form_submit', {
      category: 'conversion',
      label: form.id || 'form',
      value: 1,
      properties: {
        form_id: form.id,
        form_action: form.action,
      },
    });
  });
}

// ============================================
// EXEMPLO 5: Tracking de Scroll Customizado
// ============================================

export function exemploTrackingScrollCustomizado() {
  const tracker = getTracker();
  let scrollTracked: Set<number> = new Set();

  window.addEventListener('scroll', () => {
    const scrollPercentage = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    // Rastrear seções específicas
    const sections = [25, 50, 75, 100];
    sections.forEach((threshold) => {
      if (scrollPercentage >= threshold && !scrollTracked.has(threshold)) {
        scrollTracked.add(threshold);
        tracker.track('section_view', {
          category: 'engagement',
          label: `${threshold}%`,
          value: threshold,
          properties: {
            scroll_depth: threshold,
            page_path: window.location.pathname,
          },
        });
      }
    });
  });
}

// ============================================
// EXEMPLO 6: Tracking de Tempo Customizado
// ============================================

export function exemploTrackingTempoCustomizado() {
  const tracker = getTracker();
  const startTime = Date.now();
  let timeTracked: Set<number> = new Set();

  const intervals = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min

  intervals.forEach((seconds) => {
    setTimeout(() => {
      if (!timeTracked.has(seconds)) {
        timeTracked.add(seconds);
        tracker.track('engagement_time', {
          category: 'engagement',
          label: `${seconds}s`,
          value: seconds,
          properties: {
            time_on_page: seconds,
            page_path: window.location.pathname,
          },
        });
      }
    }, seconds * 1000);
  });
}

// ============================================
// EXEMPLO 7: Tracking de Download
// ============================================

export function exemploTrackingDownload(link: HTMLAnchorElement) {
  const tracker = getTracker();

  link.addEventListener('click', () => {
    const fileName = link.href.split('/').pop() || 'unknown';
    const fileExtension = fileName.split('.').pop() || 'unknown';

    tracker.track('file_download', {
      category: 'download',
      label: fileName,
      properties: {
        file_name: fileName,
        file_extension: fileExtension,
        file_url: link.href,
      },
    });
  });
}

// ============================================
// EXEMPLO 8: Tracking de Video
// ============================================

export function exemploTrackingVideo(video: HTMLVideoElement) {
  const tracker = getTracker();

  // Play
  video.addEventListener('play', () => {
    tracker.track('video_play', {
      category: 'video',
      label: video.src || 'unknown',
      properties: {
        video_src: video.src,
        video_duration: video.duration,
      },
    });
  });

  // Pause
  video.addEventListener('pause', () => {
    tracker.track('video_pause', {
      category: 'video',
      label: video.src || 'unknown',
      properties: {
        video_src: video.src,
        video_current_time: video.currentTime,
      },
    });
  });

  // Complete
  video.addEventListener('ended', () => {
    tracker.track('video_complete', {
      category: 'video',
      label: video.src || 'unknown',
      value: 1,
      properties: {
        video_src: video.src,
        video_duration: video.duration,
      },
    });
  });
}

// ============================================
// EXEMPLO 9: Tracking de E-commerce
// ============================================

export function exemploTrackingEcommerce(productId: string, productName: string, price: number) {
  const tracker = getTracker();

  // Adicionar ao carrinho
  tracker.track('add_to_cart', {
    category: 'ecommerce',
    label: productName,
    value: price,
    properties: {
      product_id: productId,
      product_name: productName,
      price: price,
      currency: 'BRL',
    },
  });
}

// ============================================
// EXEMPLO 10: Tracking de Erro
// ============================================

export function exemploTrackingErro(error: Error, context: string) {
  const tracker = getTracker();

  tracker.track('error', {
    category: 'error',
    label: error.message,
    properties: {
      error_message: error.message,
      error_stack: error.stack,
      context: context,
      page_url: window.location.href,
    },
  });
}

// ============================================
// EXEMPLO 11: Tracking de Busca
// ============================================

export function exemploTrackingBusca(query: string, resultsCount: number) {
  const tracker = getTracker();

  tracker.track('search', {
    category: 'search',
    label: query,
    value: resultsCount,
    properties: {
      search_query: query,
      results_count: resultsCount,
    },
  });
}

// ============================================
// EXEMPLO 12: Verificar Estatísticas da Fila
// ============================================

export async function exemploVerificarFila() {
  const tracker = getTracker();
  const stats = await tracker.getQueueStats();
  
  console.log('Eventos na fila:', stats.size);
  
  if (stats.size > 0) {
    console.log('⚠️ Há eventos pendentes na fila');
  }
}

