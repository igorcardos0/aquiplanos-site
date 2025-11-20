"use client"

export default function Operadoras() {
  return (
    <section id="operadoras" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-balance" style={{ color: "#004fd7" }}>
          Operadoras Parceiras
        </h2>
        <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
          Parceria com as maiores operadoras de saúde do Brasil
        </p>

        {/* ATENÇÃO: A classe foi alterada de "gap-8" para "gap-4" 
          para diminuir a distância entre os logos.
        */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex items-center justify-center shadow-sm hover:shadow-md transition h-32">
            <img
              src="/images/design-mode/hapvida-orig.png"
              alt="Hapvida"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
          
          <div className="bg-white rounded-lg p-8 flex items-center justify-center shadow-sm hover:shadow-md transition h-32">
            <img src="/images/design-mode/amil.png" alt="Amil" className="max-h-24 max-w-full object-contain" />
          </div>
          
          <div className="bg-white rounded-lg p-8 flex items-center justify-center shadow-sm hover:shadow-md transition h-32">
            <img
              src="/images/design-mode/bradescosaude.webp"
              alt="Bradesco Saúde"
              className="max-h-24 max-w-full object-contain"
            />
          </div>

          {/* NOVO ITEM ADICIONADO AQUI */}
          <div className="bg-white rounded-lg p-8 flex items-center justify-center shadow-sm hover:shadow-md transition h-32">
            <img
              src="/images/design-mode/sulamerica.png" 
              alt="SulAmérica"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
          {/* FIM DO NOVO ITEM */}

          <div className="bg-white rounded-lg p-8 flex items-center justify-center shadow-sm hover:shadow-md transition h-32">
            <img
              src="/images/design-mode/unimed.png"
              alt="Unimed"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}