"use client"

/**
 * RedirectCountdown Component
 * Exibe uma contagem regressiva e redireciona automaticamente após X segundos
 * 
 * IMPORTANTE: A página permanece TOTALMENTE VISÍVEL durante todo o countdown.
 * O redirecionamento acontece apenas após os segundos completos, sem ocultar a página.
 * 
 * @param seconds - Número de segundos para redirecionar (padrão: 5)
 * @param to - Rota de destino (padrão: "/")
 * @param onRedirect - Callback executado antes do redirecionamento
 * @param message - Mensagem personalizada (opcional)
 */

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface RedirectCountdownProps {
  seconds?: number
  to?: string
  onRedirect?: () => void
  message?: string
  showButton?: boolean
  buttonText?: string
}

export function RedirectCountdown({
  seconds = 5,
  to = '/',
  onRedirect,
  message,
  showButton = true,
  buttonText = 'Voltar agora',
}: RedirectCountdownProps) {
  const [countdown, setCountdown] = useState(seconds)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    // Previne múltiplos redirecionamentos
    if (hasRedirectedRef.current) return

    // Se countdown chegou a zero, redireciona
    if (countdown <= 0) {
      hasRedirectedRef.current = true
      
      // Executa callback antes de redirecionar (se fornecido)
      if (onRedirect) {
        onRedirect()
      }

      // Usa window.location.href para garantir que a página permaneça visível
      // até o último momento antes do redirecionamento completo
      // Isso evita transições do Next.js router que podem ocultar a página
      window.location.href = to
      return
    }

    // Atualiza countdown a cada segundo
    // A página permanece TOTALMENTE VISÍVEL durante todo esse processo
    const timer = setTimeout(() => {
      setCountdown((prev) => {
        // Garante que não vá abaixo de zero
        const newValue = prev - 1
        return newValue < 0 ? 0 : newValue
      })
    }, 1000)

    // Limpa timer se componente desmontar (mas isso não deve acontecer)
    return () => clearTimeout(timer)
  }, [countdown, to, onRedirect])

  const handleManualRedirect = () => {
    // Previne múltiplos redirecionamentos
    if (hasRedirectedRef.current) return
    
    hasRedirectedRef.current = true
    
    // Executa callback antes de redirecionar
    if (onRedirect) {
      onRedirect()
    }

    // Redireciona imediatamente usando window.location.href
    // A página permanece visível até o último momento
    window.location.href = to
  }

  const displayMessage = message || `Você será redirecionado em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`

  // A página permanece TOTALMENTE VISÍVEL - nenhuma condição oculta este componente
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-600 text-center">
        {displayMessage}
      </p>
      {showButton && (
        <Button
          onClick={handleManualRedirect}
          className="btn-gradient border-0 text-white hover:scale-105 transition-transform"
        >
          {buttonText}
        </Button>
      )}
    </div>
  )
}

