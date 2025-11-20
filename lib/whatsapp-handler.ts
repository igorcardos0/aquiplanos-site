import { trackConversion } from './analytics'

interface WhatsAppOptions {
  phone: string
  message: string
  redirectToObrigado?: boolean
  source?: string
}

export function handleWhatsAppClick(
  options: WhatsAppOptions,
  router?: { push: (path: string) => void }
) {
  const { redirectToObrigado = true, source = 'whatsapp' } = options

  trackConversion('whatsapp_click', {
    category: 'conversion',
    label: source,
    value: 1,
  })

  if (redirectToObrigado && router) {
    router.push(`/obrigado?source=${source}`)
  }
}

export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

