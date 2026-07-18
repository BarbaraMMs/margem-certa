import { ArrowRight } from 'lucide-react'
import MarketplaceIcon from './MarketplaceIcon'

const OUTROS_MARKETPLACES = ['shopee', 'amazon']

const MOCK_LINES = [
  { label: 'Custo do produto',      valor: '– R$ 35,00', className: 'text-gray-500' },
  { label: 'Comissão',              valor: '– R$ 12,24', className: 'text-gray-500' },
  { label: 'Lucro líquido',         valor: '+ R$ 15,93', className: 'text-green-600 font-semibold' },
]

const COMPARATIVO_MOCK = [
  { nome: 'Shopee', marketplace: 'shopee', preco: 'R$ 94,20' },
  { nome: 'Amazon', marketplace: 'amazon', preco: 'R$ 91,10' },
]

export default function LandingHero() {
  const scrollToCalc = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="relative max-w-5xl mx-auto px-6 py-14 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

        {/* ——— Texto ——— */}
        <div className="relative text-center lg:text-left max-w-md mx-auto lg:max-w-none lg:mx-0">

          {/* Headline */}
          <h1
            className="font-display text-3xl sm:text-4xl font-semibold text-ink-950 leading-[1.15] mb-4"
            style={{ textWrap: 'balance' }}
          >
            Precifique certo.<br />Lucre de verdade.
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed">
            Veja o preço ideal em cada marketplace em segundos.
          </p>

          {/* CTA */}
          <button
            onClick={scrollToCalc}
            className="group inline-flex items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-md shadow-black/10 cursor-pointer"
          >
            Calcular meu preço agora
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ——— Cards lado a lado: resultado + comparativo ——— */}
        <div className="relative">
          {/* Sombra projetada atrás dos cards */}
          <div className="absolute -inset-4 bg-brass-100/30 rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Card 1 — Preço ideal */}
            <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Preço ideal</p>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">18,2%</span>
                </div>
                <div className="text-center py-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MarketplaceIcon marketplace="mercadolivre" sizePx={14} />
                    <p className="text-[10px] text-gray-400 font-medium">Mercado Livre</p>
                  </div>
                  <p className="font-display text-3xl font-bold text-ink-950 leading-none">R$ 87,40</p>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2 flex-1">
                {MOCK_LINES.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={item.className}>{item.valor}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">Comparar em</span>
                <div className="flex items-center gap-1.5">
                  {OUTROS_MARKETPLACES.map((mkt) => (
                    <MarketplaceIcon key={mkt} marketplace={mkt} sizePx={22} />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2 — Comparativo entre marketplaces */}
            <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Comparativo</p>
                  <span className="inline-flex items-center gap-1 bg-brass-50 text-brass-700 border border-brass-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">3 canais</span>
                </div>
                <div className="text-center py-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MarketplaceIcon marketplace="mercadolivre" sizePx={14} />
                    <p className="text-[10px] text-gray-400 font-medium">Melhor opção</p>
                  </div>
                  <p className="font-display text-3xl font-bold text-ink-950 leading-none">R$ 87,40</p>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2.5 flex-1">
                {COMPARATIVO_MOCK.map((item) => (
                  <div key={item.nome} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <MarketplaceIcon marketplace={item.marketplace} sizePx={16} />
                      {item.nome}
                    </span>
                    <span className="text-gray-600 font-medium">{item.preco}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Mesma margem, preço diferente por canal</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
