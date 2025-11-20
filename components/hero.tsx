"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trackConversion } from "@/lib/analytics"

export default function Hero() {
  const router = useRouter()

  const handleWhatsApp = () => {
    // Tracking de clique no WhatsApp
    trackConversion("whatsapp_click", {
      category: "conversion",
      label: "hero_whatsapp_button",
      value: 1,
    })

    // Redireciona para página de obrigado (que depois redireciona para WhatsApp)
    router.push("/obrigado?source=whatsapp")
  }

  const scrollToForm = () => {
    const element = document.getElementById("formulario")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 gradient-primary text-white relative overflow-hidden">
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6">
            Planos de saúde empresariais com os menores reajustes do mercado
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8 text-pretty">
            A Aqui Planos conecta sua empresa às melhores operadoras de saúde do país. Já são mais de 30 mil
            vidas atendidas, com redução comprovada de custos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToForm}
              className="px-8 py-3 bg-white font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ color: "#004fd7" }}
            >
              Receber cotação agora
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Falar com especialista
            </button>
          </div>
        </div>

{/* Image placeholder */}
<div className="hidden md:block relative h-full">
  <Image
    src="/images/design-mode/pessoas.webp" // <-- CORREÇÃO AQUI
    alt="Equipe de RH"
    fill
    className="rounded-2xl shadow-2xl object-cover"
  />
</div>
      </div>
    </section>
  )
}