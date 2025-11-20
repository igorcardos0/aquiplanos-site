/**
 * WhatsApp Handler Utility
 * Centraliza a lógica de cliques no WhatsApp com tracking e redirecionamento
 */

import { trackConversion } from './analytics'

interface WhatsAppOptions {
  phone: string
  message: string
  redirectToObrigado?: boolean
  source?: string
}

/**
 * Redireciona para página de obrigado (que depois redireciona para WhatsApp)
 */
export function handleWhatsAppClick(
  options: WhatsAppOptions,
  router?: { push: (path: string) => void }
) {
  const { redirectToObrigado = true, source = 'whatsapp' } = options

  // Tracking de clique no WhatsApp
  trackConversion('whatsapp_click', {
    category: 'conversion',
    label: source,
    value: 1,
  })

  // Redireciona para página de obrigado (que depois redireciona para WhatsApp após 5s)
  if (redirectToObrigado && router) {
    router.push(`/obrigado?source=${source}`)
  }
}

/**
 * Gera URL do WhatsApp (para uso em links <a>)
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

