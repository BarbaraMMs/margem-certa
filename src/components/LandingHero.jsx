export default function LandingHero() {
  const scrollToCalc = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-white min-h-[80vh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-3xl mx-auto">
        <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-green-200">
          Calculadora para Sellers de Marketplace
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Descubra o preço certo para{' '}
          <span className="text-green-500">vender no marketplace</span>{' '}
          e ainda lucrar
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl">
          Calculadora profissional para sellers. Sem planilha, sem chute.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={scrollToCalc}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-green-200 cursor-pointer"
          >
            Calcular agora →
          </button>
          <span className="text-sm text-gray-400">Sem cadastro, resultado na hora</span>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-gray-100 w-full">
          {[
            { num: '5', label: 'Marketplaces suportados' },
            { num: '100%', label: 'Gratuito no beta' },
            { num: '< 1min', label: 'Para precificar' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-green-600">{s.num}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
