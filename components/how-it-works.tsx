import { Mail, BarChart3, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Mail,
      number: "1",
      title: "Envie seus dados",
      description: "Preencha o formulário com as informações da sua empresa",
    },
    {
      icon: BarChart3,
      number: "2",
      title: "Receba as melhores opções",
      description: "Nossa equipe analisa e entende o que realmente sua empresa precisa",
    },
    {
      icon: CheckCircle,
      number: "3",
      title: "Escolha o plano ideal",
      description: "Compare, escolha o melhor para sua empresa e comece a economizar",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-balance" style={{ color: "#004fd7" }}>
          Em 3 passos, sua empresa garante o melhor plano de saúde empresarial
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
                    style={{ background: "linear-gradient(to right, #004fd7, #06b28c)" }}
                  >
                    {step.number}
                  </div>
                  <Icon className="w-12 h-12 mx-auto mb-4" style={{ color: "#06b28c" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#004fd7" }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 -right-4 w-8 h-1"
                    style={{ background: "linear-gradient(to right, #004fd7, #06b28c)" }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
