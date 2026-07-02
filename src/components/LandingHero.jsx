export default function LandingHero() {
  const scrollToCalc = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-white min-h-[80vh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-3xl mx-auto">
        <span className="inline-block bg-brass-100 text-brass-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-brass-100">
          Calculadora para Sellers de Marketplace
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink-950 leading-tight mb-5" style={{ textWrap: 'balance' }}>
          Descubra o preço certo para{' '}
          <span className="text-brass-600">vender no marketplace</span>{' '}
          e ainda lucrar
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl">
          Calculadora profissional para sellers. Sem planilha, sem chute.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={scrollToCalc}
            className="bg-ink-900 hover:bg-ink-800 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-ink-900/15 cursor-pointer"
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
              <p className="text-2xl font-bold text-brass-600">{s.num}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
