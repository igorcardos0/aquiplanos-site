"use client"

import { Mail, Phone } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { handleWhatsAppClick } from "@/lib/whatsapp-handler"

export default function Footer() {
  const router = useRouter()
  const phoneNumber = "5541995420485"
  const message = "Olá! Gostaria de solicitar uma cotação para saúde empresarial. Pode me ajudar?"

  const handleWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    handleWhatsAppClick(
      {
        phone: phoneNumber,
        message: message,
        redirectToObrigado: true,
        source: 'footer_whatsapp',
      },
      router
    )
  }

  return (
    <footer className="bg-[#004fd7] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Brand - Logo com altura atualizada */}
          <div>
            <Image
              src="/images/design-mode/logobranca.png"
              alt="Aqui Planos Logo"
              width={120}
              height={60}
              className="w-auto mb-4 h-[68px]"
            />
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                onClick={handleWhatsApp}
                className="flex items-center gap-2 text-white/70 hover:text-white transition cursor-pointer"
              >
                <Phone size={16} />
                <span>(41) 99542-0485</span>
              </a>
              <a
                href="mailto:contato@aquiplanos.com.br"
                className="flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <Mail size={16} />
                <span>contato@aquiplanos.com.br</span>
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-white/70 hover:text-white transition text-sm">
                Política de Privacidade
              </a>
              <a href="#" className="block text-white/70 hover:text-white transition text-sm">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 py-8">
          <p className="text-center text-white/70 text-xs mb-4">
            AQUI PLANOS CORRETAGEM DE SEGUROS LTDA | CNPJ: 55.329.214/0001-06 | SUSEP: 242158825
          </p>
          <p className="text-center text-white/60 text-sm">
            © 2025 Aqui Planos. Todos os direitos reservados.
          </p>

          {/* ===== ASSINATURA DO DESENVOLVEDOR (Versão Fundo Preto) ===== */}
          <div className="flex justify-center mt-8">
            <Image
              src="/images/design-mode/v4.png" // <-- ATUALIZE ESTE CAMINHO
              alt="Projeto Desenvolvido por V4 Rosolen Veronze & Co."
              width={250} // Largura base
              height={45} // Altura base
              className="w-auto h-10" // Imagem com 40px de altura
            />
          </div>
          {/* ========================================================== */}
          
        </div>
      </div>
    </footer>
  )
}