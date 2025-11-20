import Image from 'next/image'; 

const trustedCompanies = [
  { name: "Casa Magalhães", logoPath: "/images/design-mode/casamagalhaes.png" },
  { name: "Droga Vet", logoPath: "/images/design-mode/drogavet.png" },
  { name: "GoCoffee", logoPath: "/images/design-mode/gocoffee.png" },
];

export default function SocialProof() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-balance" style={{ color: "#004fd7" }}>
            Empresas que confiam na Aqui Planos
          </h2>

          <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Mais de 30 mil vidas empresariais atendidas com condições exclusivas e suporte contínuo.
          </p>

          <div className="flex flex-wrap justify-center gap-12 md:gap-16 items-center mb-16 px-4">
            {trustedCompanies.map((company) => (
              <div 
                key={company.name} 
                className="text-center p-2 transition hover:opacity-75 flex items-center justify-center"
                style={{ maxWidth: '180px' }}
              >
                <img 
                  src={company.logoPath} 
                  alt={`Logo da ${company.name}`} 
                  className={`mx-auto w-auto ${company.name === 'GoCoffee' ? 'max-h-24' : 'max-h-16'}`}
                />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2" style={{ color: "#06b28c" }}>
                30.000+
              </div>
              <p className="text-gray-600 text-lg">Vidas empresariais atendidas</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2" style={{ color: "#004fd7" }}>
                350+
              </div>
              <p className="text-gray-600 text-lg">Empresas ativas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}