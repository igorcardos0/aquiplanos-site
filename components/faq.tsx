"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Quantos funcionários a empresa precisa ter para que o plano de saúde não tenha carência?",
      answer:
        "A partir de 30 vidas, aqui na Aqui Planos, o seu time já entra sem carência — garantindo acesso imediato.",
    },
    {
      question: "A cotação é gratuita?",
      answer:
        "Sim! Nossa cotação é totalmente gratuita e sem compromisso. Enviamos as melhores propostas em até 24h para análise.",
    },
    {
      question: "Quais operadoras vocês trabalham?",
      answer:
        "Trabalhos com as principais operadoras do mercado: Bradesco Saúde, Amil, SulAmerica, Unimed, Hapvida e outras. Sempre buscamos as melhores condições para seu negócio.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance" style={{ color: "#004fd7" }}>
          Dúvidas frequentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <h3 className="text-left font-semibold" style={{ color: "#004fd7" }}>
                  {faq.question}
                </h3>
                <ChevronDown
                  size={24}
                  className="transition-transform"
                  style={{
                    color: "#06b28c",
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
