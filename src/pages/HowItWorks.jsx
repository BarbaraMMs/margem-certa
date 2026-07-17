import { Wallet, ShoppingCart, BarChart3 } from 'lucide-react'

const STEPS = [
  {
    icon: Wallet,
    title: 'Informe seus custos',
    desc: 'Digite o custo do produto, frete e outros gastos fixos. A calculadora usa esses dados para garantir que você nunca venda no prejuízo.',
  },
  {
    icon: ShoppingCart,
    title: 'Escolha o marketplace',
    desc: 'Selecione onde você quer vender: Mercado Livre, Shopee ou Amazon. As taxas de cada plataforma já estão incluídas automaticamente.',
  },
  {
    icon: BarChart3,
    title: 'Veja o preço ideal e a margem real',
    desc: 'A calculadora exibe o preço de venda sugerido, a margem líquida real e uma projeção de lucro mensal — tudo atualizado em tempo real enquanto você ajusta os valores.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-gray-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-semibold text-ink-950 mb-2">Como funciona</h2>
          <p className="text-gray-500">Três passos para precificar com confiança</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-brass-100 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-ink-900" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
