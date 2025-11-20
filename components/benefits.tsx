// app/components/Benefits.tsx (ou o caminho onde está seu arquivo)
"use client" // 1. Necessário para interações de clique

import { Zap, TrendingDown, Users } from "lucide-react"
import { trackConversion } from "@/lib/analytics" // 2. Importamos nosso rastreador

export default function Benefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Planos diretos das operadoras",
      description:
        "Negociação sem atravessadores e 100% transparente. Você negocia direto com quem realmente oferece o melhor preço.",
    },
    {
      icon: TrendingDown,
      title: "Reajustes menores e previsíveis",
      description:
        "Condições que reduzem o impacto anual no orçamento de RH. Maior previsibilidade para planejamento financeiro.",
    },
    {
      icon: Users,
      title: "Atendimento consultivo e humanizado",
      description:
        "Da cotação ao pós-venda, com suporte contínuo. Nossa empresa estará sempre junto para atuar na gestão do contrato.",
    },
  ]

  // 3. Função para disparar o evento quando clicar
  const handleCTAClick = () => {
    trackConversion("Click", {
      category: "CTA",
      label: "Botao Beneficios - Quero Reduzir Custos",
      section: "Beneficios"
    });
  };

  return (
    <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-balance" style={{ color: "#004fd7" }}>
          Por que escolher a Aqui Planos para cuidar da saúde da sua equipe?
        </h2>

        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
          Diferenciais que fazem a diferença no seu negócio
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition border-t-4"
                style={{ borderTopColor: "#06b28c" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(to right, #004fd7, #06b28c)" }}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#004fd7" }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          {/* 4. Adicionado o onClick aqui */}
          <a 
            href="#formulario" 
            onClick={handleCTAClick}
            className="btn-gradient px-8 py-3 inline-block" // inline-block ajuda na renderização do botão
          >
            Quero reduzir os custos do meu plano
          </a>
        </div>
      </div>
    </section>
  )
}