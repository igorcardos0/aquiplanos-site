"use client"

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
    if (hasRedirectedRef.current) return

    if (countdown <= 0) {
      hasRedirectedRef.current = true
      
      if (onRedirect) {
        onRedirect()
      }

      window.location.href = to
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        const newValue = prev - 1
        return newValue < 0 ? 0 : newValue
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, to, onRedirect])

  const handleManualRedirect = () => {
    if (hasRedirectedRef.current) return
    
    hasRedirectedRef.current = true
    
    if (onRedirect) {
      onRedirect()
    }

    window.location.href = to
  }

  const displayMessage = message || `Você será redirecionado em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`

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

