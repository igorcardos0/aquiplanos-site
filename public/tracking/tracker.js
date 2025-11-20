(function() {
  'use strict';

  const DEFAULT_CONFIG = {
    apiEndpoint: '/api/events',
    apiKey: '',
    enabled: true,
    debug: false,
    scrollThresholds: [25, 50, 75, 100],
    timeThresholds: [10, 30, 60],
  };

  let config = { ...DEFAULT_CONFIG };
  let initialized = false;
  let sessionId = null;

  function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function getSessionId() {
    if (!sessionId) {
      sessionId = sessionStorage.getItem('tracking_session_id');
      if (!sessionId) {
        sessionId = 'session-' + generateId();
        sessionStorage.setItem('tracking_session_id', sessionId);
      }
    }
    return sessionId;
  }

  function createEvent(type, name, options = {}) {
    return {
      id: generateId(),
      type: type,
      name: name,
      category: options.category,
      label: options.label,
      value: options.value,
      properties: options.properties || {},
      timestamp: Date.now(),
      page: {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer || undefined,
      },
      user: {
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        language: navigator.language,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      },
      metadata: options.metadata || {},
    };
  }

  function sendEvent(event) {
    if (!config.enabled || !config.apiEndpoint) {
      return;
    }

    if (window.fbq && typeof window.fbq === 'function') {
      try {
        window.fbq('track', event.name || 'CustomEvent', {
          content_name: event.name,
          content_category: event.category,
        });
      } catch (e) {
        if (config.debug) console.error('Erro ao enviar para Meta Pixel:', e);
      }
    }

    if (window.gtag && typeof window.gtag === 'function') {
      try {
        window.gtag('event', event.name || 'custom_event', {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      } catch (e) {
        if (config.debug) console.error('Erro ao enviar para GA:', e);
      }
    }

    fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey || '',
      },
      body: JSON.stringify({
        events: [event],
        api_key: config.apiKey || '',
      }),
    }).catch(function(error) {
      if (config.debug) {
        console.warn('Erro ao enviar evento:', error);
      }
    });
  }

  function trackClick(element) {
    const event = createEvent('click', 'button_click', {
      category: 'interaction',
      label: element.textContent?.trim().substring(0, 100) || element.id || 'unknown',
      metadata: {
        element_id: element.id,
        element_class: element.className,
        element_tag: element.tagName.toLowerCase(),
        element_text: element.textContent?.trim().substring(0, 100),
      },
    });

    sendEvent(event);
  }

  let scrollTracked = {};
  function trackScroll() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

    config.scrollThresholds.forEach(function(threshold) {
      if (scrollPercentage >= threshold && !scrollTracked[threshold]) {
        scrollTracked[threshold] = true;

        const event = createEvent('scroll', 'scroll_depth', {
          category: 'engagement',
          label: threshold + '%',
          value: threshold,
          metadata: {
            scroll_depth: threshold,
          },
        });

        sendEvent(event);
      }
    });
  }

  let timeTracked = {};
  function trackTime() {
    config.timeThresholds.forEach(function(threshold) {
      setTimeout(function() {
        if (!timeTracked[threshold]) {
          timeTracked[threshold] = true;

          const event = createEvent('time_on_page', 'time_on_page', {
            category: 'engagement',
            label: threshold + 's',
            value: threshold,
            metadata: {
              time_on_page: threshold,
            },
          });

          sendEvent(event);
        }
      }, threshold * 1000);
    });
  }

  function init(userConfig) {
    if (initialized) {
      if (config.debug) console.warn('Tracker já inicializado');
      return;
    }

    config = Object.assign({}, DEFAULT_CONFIG, userConfig || {});

    if (!config.enabled) {
      return;
    }

    const pageviewEvent = createEvent('page_view', 'page_view', {
      label: window.location.pathname,
    });
    sendEvent(pageviewEvent);

    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.closest('[data-track-ignore]')) {
        return;
      }

      const clickable = target.closest('button, a, [data-track], [role="button"]');
      if (clickable) {
        trackClick(clickable);
      }
    });

    window.addEventListener('scroll', trackScroll, { passive: true });

    trackTime();

    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (form.tagName === 'FORM') {
        const event = createEvent('form_submit', 'form_submit', {
          category: 'conversion',
          value: 1,
          metadata: {
            form_id: form.id,
          },
        });
        sendEvent(event);
      }
    });

    initialized = true;

    if (config.debug) {
      console.log('✅ Tracking inicializado');
    }
  }

  window.TrackingSystem = {
    init: init,
    track: function(name, options) {
      const event = createEvent('custom', name, options);
      sendEvent(event);
    },
    pageview: function() {
      const event = createEvent('page_view', 'page_view', {
        label: window.location.pathname,
      });
      sendEvent(event);
    },
  };

  if (window.TRACKING_CONFIG) {
    init(window.TRACKING_CONFIG);
  }
})();

