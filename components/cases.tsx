export default function Cases() {
  const testimonials = [
    {
      company: "Casa Magalhães",
      text: "Conseguimos reduzir 25% dos custos com saúde empresarial mantendo a qualidade do atendimento.",
      author: "Gerente de RH",
    },
    {
      company: "Droga Vet",
      text: "O atendimento da Aqui Planos foi impecável. Resolveu nossa situação em tempo recorde.",
      author: "Diretora Administrativa",
    },
    {
      company: "GoCoffee",
      text: "Depois de trabalhar com a Aqui Planos, nossos colaboradores têm muito mais satisfação.",
      author: "Especialista em Recursos Humanos",
    },
  ]

  return (
    <section id="cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-balance" style={{ color: "#004fd7" }}>
          O que nossos clientes falam sobre nós
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#06b28c" }}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              <div>
                <p className="font-bold" style={{ color: "#004fd7" }}>
                  {testimonial.company}
                </p>
                <p className="text-sm text-gray-500">{testimonial.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
