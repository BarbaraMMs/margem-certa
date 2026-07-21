import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Package, Star, AlertCircle, PackageOpen } from 'lucide-react'
import { getCatalogo, getMarketplaceLabel } from '../utils/storageUtils'
import { calcularMelhorOferta, formatBRL, formatPct } from '../utils/pricingLogic'
import MarketplaceIcon from '../components/MarketplaceIcon'

function SummaryCard({ icon: Icon, label, value, sub, cor = 'gray' }) {
  const cores = {
    green:  'bg-green-50 border-green-100 text-green-700',
    red:    'bg-red-50 border-red-100 text-red-600',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    gray:   'bg-card border-brass-100 text-gray-700',
  }
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${cores[cor]}`}>
      <Icon className="w-6 h-6 mb-2" strokeWidth={2} />
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 text-gray-400 truncate">{sub}</p>}
    </div>
  )
}

function BarraHorizontal({ label, marketplace, margem, maxMargem }) {
  const pct = maxMargem > 0 ? (margem / maxMargem) * 100 : 0
  const cor = margem >= 0.15
    ? 'bg-green-500'
    : margem >= 0.05
      ? 'bg-amber-400'
      : 'bg-red-400'
  const textCor = margem >= 0.15 ? 'text-green-700' : margem >= 0.05 ? 'text-amber-700' : 'text-red-600'

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 text-sm text-gray-700 truncate flex items-center gap-1.5">
        <MarketplaceIcon marketplace={marketplace} sizePx={16} />
        {label}
      </div>
      <div className="flex-1 bg-brass-50 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${cor}`}
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <div className={`w-14 text-right text-sm font-bold shrink-0 ${textCor}`}>
        {formatPct(margem)}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const catalogo = getCatalogo()

  const dados = useMemo(() => {
    return catalogo.map(p => {
      const melhor = calcularMelhorOferta(p)
      return { ...p, melhor }
    }).filter(p => p.melhor)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalProdutos = dados.length
  const margemMedia = totalProdutos > 0
    ? dados.reduce((acc, p) => acc + p.melhor.margemReal, 0) / totalProdutos
    : 0
  const criticos = dados.filter(p => p.melhor.margemReal < 0.05)
  const melhorProduto = [...dados].sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)[0]

  const porMarketplace = useMemo(() => {
    const mapa = {}
    dados.forEach(p => {
      if (!mapa[p.marketplace]) mapa[p.marketplace] = { total: 0, soma: 0 }
      mapa[p.marketplace].total += 1
      mapa[p.marketplace].soma += p.melhor.margemReal
    })
    return Object.entries(mapa)
      .map(([id, v]) => ({ id, media: v.soma / v.total, total: v.total }))
      .sort((a, b) => b.media - a.media)
  }, [dados])

  const maxMargem = porMarketplace.reduce((m, r) => Math.max(m, r.media), 0)

  if (totalProdutos === 0) {
    return (
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-semibold text-ink-950 mb-2">Painel</h1>
        <div className="bg-card rounded-2xl border border-brass-100 shadow-md p-10 text-center">
          <PackageOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-600 font-medium mb-1">Nenhum dado para exibir</p>
          <p className="text-gray-400 text-sm mb-5">
            Salve pelo menos um produto no catálogo para visualizar o painel.
          </p>
          <Link
            to="/catalogo"
            className="bg-ink-900 hover:bg-ink-800 text-brass-100 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors inline-block"
          >
            Ir para o catálogo →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 px-4 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950 mb-1">Painel</h1>
        <p className="text-sm text-gray-500">
          Aqui você vê um resumo de todos os produtos salvos no seu catálogo.
          Produtos críticos são aqueles com margem abaixo de 5%.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          icon={Package}
          label="Produtos salvos"
          value={totalProdutos}
          cor="gray"
        />
        <SummaryCard
          icon={BarChart3}
          label="Margem média"
          value={formatPct(margemMedia)}
          cor={margemMedia >= 0.15 ? 'green' : margemMedia >= 0.05 ? 'amber' : 'red'}
        />
        <SummaryCard
          icon={Star}
          label="Melhor margem"
          value={formatPct(melhorProduto?.melhor.margemReal)}
          sub={melhorProduto?.nome || '—'}
          cor="green"
        />
        <SummaryCard
          icon={AlertCircle}
          label="Críticos (< 5%)"
          value={criticos.length}
          sub={criticos.length > 0 ? criticos.map(p => p.nome).join(', ') : 'Nenhum'}
          cor={criticos.length > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Alerta críticos */}
      {criticos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-red-700 mb-1">
            <AlertCircle className="w-4 h-4" strokeWidth={2} />
            {criticos.length} produto{criticos.length > 1 ? 's' : ''} com margem crítica
          </p>
          <p className="text-xs text-red-500 mb-3">
            Estes produtos estão sendo vendidos com margem abaixo de 5%. Revise o preço, o custo do produto ou o frete.
          </p>
          <div className="flex flex-wrap gap-2">
            {criticos.map(p => (
              <Link
                key={p.id}
                to={`/?mkt=${p.marketplace}&custo=${p.costs.custoProduto}&frete=${p.costs.freteAbsorvido}&outros=${p.costs.outrosCustos}&ads=${p.sliders.ads}&imp=${p.sliders.imposto}&dev=${p.sliders.devolucao}&margem=${p.sliders.margemAlvo}`}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                {p.nome} — {formatPct(p.melhor.margemReal)} → Recalcular
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico de barras por marketplace */}
      {porMarketplace.length > 0 && (
        <div className="bg-card rounded-2xl border border-brass-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Margem média por marketplace</h2>
          <p className="text-xs text-gray-400 mb-5">
            Média das melhores margens (Clássico ou Premium) de cada produto no marketplace.
          </p>
          <div className="space-y-4">
            {porMarketplace.map(r => (
              <div key={r.id}>
                <BarraHorizontal
                  label={getMarketplaceLabel(r.id)}
                  marketplace={r.id}
                  margem={r.media}
                  maxMargem={maxMargem}
                />
                <p className="text-xs text-gray-400 ml-35 mt-0.5 pl-36">
                  {r.total} produto{r.total > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-brass-100 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥ 15% (saudável)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> 5–15% (atenção)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> &lt; 5% (crítico)</span>
          </div>
        </div>
      )}

      {/* Tabela de todos os produtos */}
      <div className="bg-card rounded-2xl border border-brass-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brass-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Todos os produtos</h2>
          <Link to="/catalogo" className="text-xs text-brass-600 hover:underline">
            Gerenciar catálogo →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {dados
            .sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)
            .map(p => {
              const isCritico = p.melhor.margemReal < 0.05
              return (
                <div key={p.id} className={`flex items-center gap-4 px-6 py-3 ${isCritico ? 'bg-red-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.nome || 'Produto sem nome'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <MarketplaceIcon marketplace={p.marketplace} sizePx={14} />
                      {getMarketplaceLabel(p.marketplace)}
                      {p.categoria ? ` · ${p.categoria}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">{formatBRL(p.melhor.precoIdeal)}</p>
                    <p className={`text-xs font-semibold ${isCritico ? 'text-red-500' : p.melhor.margemReal >= 0.15 ? 'text-green-600' : 'text-amber-600'}`}>
                      {formatPct(p.melhor.margemReal)}
                    </p>
                  </div>
                  <Link
                    to={`/?mkt=${p.marketplace}&custo=${p.costs.custoProduto}&frete=${p.costs.freteAbsorvido}&outros=${p.costs.outrosCustos}&ads=${p.sliders.ads}&imp=${p.sliders.imposto}&dev=${p.sliders.devolucao}&margem=${p.sliders.margemAlvo}`}
                    className="text-xs bg-gray-100 hover:bg-brass-100 text-gray-600 hover:text-ink-900 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
                  >
                    Calcular
                  </Link>
                </div>
              )
            })}
        </div>
      </div>

    </section>
  )
}
