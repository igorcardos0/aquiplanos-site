"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { RedirectCountdown } from '@/components/redirect-countdown'
import { CheckCircle2, Mail, Phone } from 'lucide-react'
import { trackConversion } from '@/lib/analytics'

function ObrigadoContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source') || 'form'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackConversion('page_view_obrigado', {
        category: 'conversion',
        label: source,
        value: 1,
      })

      if ((window as any).TrackingSystem) {
        ;(window as any).TrackingSystem.track('page_view_obrigado', {
          category: 'conversion',
          source: source,
        })
      }

      if ((window as any).fbq) {
        ;(window as any).fbq('track', 'Lead', {
          content_name: 'obrigado_page',
          source: source,
        })
      }

      if ((window as any).gtag) {
        ;(window as any).gtag('event', 'page_view_obrigado', {
          event_category: 'conversion',
          event_label: 'obrigado_page_view',
          source: source,
        })
      }
    }
  }, [source])

  const getMessage = () => {
    if (source === 'whatsapp') {
      return {
        title: 'Obrigado! Sua mensagem foi enviada.',
        subtitle:
          'Nossa equipe entrará em contato pelo WhatsApp em breve. Aguarde nossa resposta!',
      }
    }
    return {
      title: 'Obrigado! Sua solicitação foi recebida.',
      subtitle:
        'Nossa equipe analisará sua solicitação e entrará em contato em até 2 horas úteis. Enviaremos as melhores opções de planos de saúde para o seu CNPJ.',
    }
  }

  const message = getMessage()

  const getRedirectDestination = () => {
    if (source === 'whatsapp') {
      const whatsappMessage = 'Olá! Gostaria de solicitar uma cotação para saúde empresarial. Pode me ajudar?'
      return `https://wa.me/5541995420485?text=${encodeURIComponent(whatsappMessage)}`
    }
    return '/'
  }

  const redirectDestination = getRedirectDestination()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 gradient-primary">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-scale-in"
                  style={{
                    background: 'linear-gradient(to right, #004fd7, #06b28c)',
                  }}
                >
                  <CheckCircle2 className="text-white" size={48} strokeWidth={2} />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#004fd7] to-[#06b28c] opacity-20 animate-ping" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance" style={{ color: '#004fd7' }}>
              {message.title}
            </h1>

            <p className="text-lg text-gray-600 mb-8 text-pretty max-w-xl mx-auto">
              {message.subtitle}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="text-[#06b28c]" size={20} />
                <div className="text-left">
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-semibold text-gray-900">contato@aquiplanos.com.br</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="text-[#06b28c]" size={20} />
                <div className="text-left">
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-semibold text-gray-900">(41) 99542-0485</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <RedirectCountdown
                seconds={5}
                to={redirectDestination}
                buttonText={source === 'whatsapp' ? 'Ir para WhatsApp agora' : 'Voltar agora'}
                onRedirect={() => {
                  trackConversion('obrigado_page_redirect', {
                    category: 'navigation',
                    label: source === 'whatsapp' ? 'redirect_to_whatsapp' : 'redirect_to_home',
                    value: 1,
                  })

                  if (typeof window !== 'undefined' && (window as any).TrackingSystem) {
                    ;(window as any).TrackingSystem.track('obrigado_page_redirect', {
                      category: 'navigation',
                      source: source,
                      destination: source === 'whatsapp' ? 'whatsapp' : 'home',
                    })
                  }
                }}
              />
            </div>
          </div>

          <p className="text-white/80 text-center mt-6 text-sm">
            Enquanto isso, você pode continuar navegando em nosso site para conhecer mais sobre nossos serviços.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ObrigadoContent />
    </Suspense>
  )
}

