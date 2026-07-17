import { CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'

const FEATURES = [
  'Comissão, frete e impostos calculados automaticamente',
  'Mercado Livre, Shopee e Amazon com taxas atualizadas',
  'Comparativo entre marketplaces em um clique',
]

const MOCK_ITENS = [
  { label: 'Preço de venda', valor: 'R$ 87,40', destaque: true },
  { label: 'Custo do produto', valor: '– R$ 35,00' },
  { label: 'Comissão marketplace', valor: '– R$ 12,24' },
  { label: 'Margem líquida', valor: 'R$ 15,93', positivo: true },
]

export default function LandingHero() {
  const scrollToCalc = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-ink-900">
      {/* Glow de fundo — sutil, mesma paleta do resto do app */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-brass-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Coluna de texto */}
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-brass-100 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-white/10">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
            Ferramenta de precificação para sellers
          </span>

          <h1
            className="font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.1] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Preço ideal e margem real, calculados em segundos
          </h1>

          <p className="text-lg text-ink-100/70 mb-8 max-w-md leading-relaxed">
            Informe seus custos e veja quanto cobrar em cada marketplace para não vender no prejuízo — sem planilha, sem chute.
          </p>

          <ul className="space-y-2.5 mb-9">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-100/80">
                <CheckCircle2 className="w-4 h-4 text-brass-100 shrink-0 mt-0.5" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <button
              onClick={scrollToCalc}
              className="group flex items-center gap-2 bg-brass-600 hover:bg-brass-700 text-ink-950 font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-black/20 cursor-pointer"
            >
              Calcular meu preço agora
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </button>
            <span className="text-sm text-ink-100/50">Gratuito, sem cadastro</span>
          </div>
        </div>

        {/* Coluna visual — preview do resultado */}
        <div className="relative">
          <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-2xl" />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Preço ideal calculado</p>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                Margem 18,2%
              </span>
            </div>

            <div className="space-y-0">
              {MOCK_ITENS.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <span className={`text-sm ${item.destaque ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.destaque ? 'text-ink-900 text-base' : item.positivo ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Comparar em</span>
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-brass-100 flex items-center justify-center text-sm" title="Mercado Livre">🛒</span>
                <span className="w-7 h-7 rounded-full bg-brass-100 flex items-center justify-center text-sm" title="Shopee">🟠</span>
                <span className="w-7 h-7 rounded-full bg-brass-100 flex items-center justify-center text-sm" title="Amazon">📦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
