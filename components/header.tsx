"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isObrigadoPage = pathname === '/obrigado'

  const scrollToSection = (id: string) => {
    if (isObrigadoPage) {
      router.push(`/#${id}`)
      setIsOpen(false)
      return
    }

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    } else {
      router.push(`/#${id}`)
      setIsOpen(false)
    }
  }

  const scrollToTop = () => {
    if (isObrigadoPage) {
      router.push('/')
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button onClick={scrollToTop} className="flex items-center gap-2 hover:opacity-80 transition">
          <Image
            src="/images/design-mode/logocolorida.webp"
            alt="Aqui Planos Logo"
            width={40}
            height={40}
            className="h-15 w-auto shadow-none text-foreground cursor-pointer"
          />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("beneficios")}
            className="transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
          >
            Benefícios
          </button>
          <button
            onClick={() => scrollToSection("operadoras")}
            className="transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
          >
            Operadoras
          </button>
          <button
            onClick={() => scrollToSection("cases")}
            className="transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
          >
            Cases
          </button>
          <button
            onClick={() => scrollToSection("como-funciona")}
            className="transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
          >
            Como Funciona
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
          >
            Contato
          </button>
        </nav>

        <div className="hidden md:block">
          <button onClick={() => scrollToSection("formulario")} className="btn-gradient px-6 py-2 cursor-pointer">
            Solicitar Cotação
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#004fd7] hover:text-[#06b28c] cursor-pointer transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col gap-4 p-4">
            <button
              onClick={() => scrollToSection("beneficios")}
              className="text-left transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
            >
              Benefícios
            </button>
            <button
              onClick={() => scrollToSection("operadoras")}
              className="text-left transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
            >
              Operadoras
            </button>
            <button
              onClick={() => scrollToSection("cases")}
              className="text-left transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
            >
              Cases
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-left transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left transition-colors text-[#004fd7] hover:text-[#06b28c] cursor-pointer"
            >
              Contato
            </button>
            <button onClick={() => scrollToSection("formulario")} className="btn-gradient px-6 py-2 w-full">
              Solicitar Cotação
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
