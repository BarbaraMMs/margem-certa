import { useMemo } from 'react'
import { Scale, Info } from 'lucide-react'
import { calcularPrecificacao, formatBRL, formatPct, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import { getMarketplaces, getCondicoes } from '../utils/storageUtils'

export default function ComparativoMarketplaces({ costs, sliders, condicoes, categoria, marketplace, customFees, campanhaShopee }) {
  const condicoesAtivas = useMemo(() => condicoes || getCondicoes(), [condicoes])

  const linhas = useMemo(() => {
    const marketplaces = getMarketplaces(condicoesAtivas)

    return marketplaces
      .map(mkt => {
        const resultado = calcularPrecificacao({
          ...costs,
          marketplace: mkt.id,
          categoria: categoria || null,
          ...sliders,
          condicoes: condicoesAtivas,
          customFees: mkt.id === marketplace ? customFees : null,
          campanhaShopee: mkt.id === 'shopee' && mkt.id === marketplace && campanhaShopee,
        })

        const cl = resultado?.classico
        const pr = resultado?.premium
        let melhor = null
        let tipo = null

        if (cl && !cl.error && pr && !pr.error) {
          if (cl.margemReal >= pr.margemReal) { melhor = cl; tipo = 'Clássico' }
          else                                { melhor = pr; tipo = 'Premium'  }
        } else if (cl && !cl.error) { melhor = cl; tipo = 'Clássico' }
        else if (pr && !pr.error)   { melhor = pr; tipo = 'Premium'  }

        // Só o Mercado Livre tem, de fato, tipos de anúncio diferentes.
        if (melhor && !MARKETPLACES_COM_CLASSICO_PREMIUM.includes(mkt.id)) tipo = '—'

        return { mkt, melhor, tipo }
      })
      .filter(l => l.melhor != null)
      .sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)
  }, [costs, sliders, condicoesAtivas, categoria, marketplace, customFees, campanhaShopee])

  if (!linhas.length) return null

  const melhorMargem = linhas[0].melhor.margemReal

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900">
          <Scale className="w-4 h-4" strokeWidth={2} />
        </span>
        Comparativo entre Marketplaces
      </h2>
      <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-4 ml-9">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
        Este comparativo usa os mesmos custos que você preencheu acima e recalcula o preço ideal e a margem para cada marketplace configurado em Condições Comerciais.
      </p>

      {/* Tabela desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-semibold">Marketplace</th>
              <th className="text-left px-4 py-3 font-semibold">Anúncio</th>
              <th className="text-right px-4 py-3 font-semibold">Taxa aplicada</th>
              <th className="text-right px-4 py-3 font-semibold">Custos fixos extras</th>
              <th className="text-right px-4 py-3 font-semibold">Custo de transação</th>
              <th className="text-right px-4 py-3 font-semibold">Preço ideal</th>
              <th className="text-right px-4 py-3 font-semibold">Margem</th>
              <th className="text-right px-4 py-3 font-semibold">Lucro / un.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linhas.map(({ mkt, melhor, tipo }, i) => {
              const isMelhor = melhor.margemReal === melhorMargem && i === 0
              const custosFixosExtras = (melhor.detalheTaxas.taxaFixaReais || 0) + (melhor.detalheTaxas.freteCoParticipacaoReais || 0)
              const custoTransacao = ((melhor.detalheTaxas.taxaTransacao || 0) + (melhor.detalheTaxas.taxaCampanha || 0)) * melhor.precoIdeal
              return (
                <tr
                  key={mkt.id}
                  className={`transition-colors ${isMelhor ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span className="mr-2">{mkt.emoji}</span>
                    {mkt.label}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{tipo}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatPct(melhor.detalheTaxas.taxaMarketplace)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {custosFixosExtras > 0 ? formatBRL(custosFixosExtras) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {custoTransacao > 0 ? formatBRL(custoTransacao) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {formatBRL(melhor.precoIdeal)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${isMelhor ? 'text-green-700' : melhor.margemReal < 0.05 ? 'text-red-500' : 'text-gray-700'}`}>
                      {formatPct(melhor.margemReal)}
                      {isMelhor && <span className="ml-1 text-green-600">★</span>}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatBRL(melhor.lucroPorUnidade)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="sm:hidden space-y-3">
        {linhas.map(({ mkt, melhor, tipo }, i) => {
          const isMelhor = melhor.margemReal === melhorMargem && i === 0
          const custosFixosExtras = (melhor.detalheTaxas.taxaFixaReais || 0) + (melhor.detalheTaxas.freteCoParticipacaoReais || 0)
          const custoTransacao = ((melhor.detalheTaxas.taxaTransacao || 0) + (melhor.detalheTaxas.taxaCampanha || 0)) * melhor.precoIdeal
          return (
            <div
              key={mkt.id}
              className={`rounded-xl border p-4 ${isMelhor ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-800">
                  {mkt.emoji} {mkt.label}
                </span>
                {isMelhor && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">★ Melhor</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Anúncio</p>
                  <p className="font-medium text-gray-700">{tipo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Taxa aplicada</p>
                  <p className="font-medium text-gray-700">{formatPct(melhor.detalheTaxas.taxaMarketplace)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custos fixos extras</p>
                  <p className="font-medium text-gray-700">
                    {custosFixosExtras > 0 ? formatBRL(custosFixosExtras) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custo de transação</p>
                  <p className="font-medium text-gray-700">
                    {custoTransacao > 0 ? formatBRL(custoTransacao) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Preço ideal</p>
                  <p className="font-semibold text-gray-800">{formatBRL(melhor.precoIdeal)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Margem</p>
                  <p className={`font-bold ${isMelhor ? 'text-green-700' : melhor.margemReal < 0.05 ? 'text-red-500' : 'text-gray-700'}`}>
                    {formatPct(melhor.margemReal)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Lucro / un.</p>
                  <p className={`font-medium ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatBRL(melhor.lucroPorUnidade)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ★ = melhor margem entre os marketplaces configurados. Taxas baseadas em Condições Comerciais — ajuste em <a href="/configuracoes" className="underline hover:text-gray-600">Condições Comerciais</a>.
      </p>

      <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500 leading-relaxed">
        <p className="font-medium text-gray-600 mb-1">Por que os preços ideais são tão diferentes entre marketplaces?</p>
        <p>
          Todos são calculados para atingir a <strong>mesma margem líquida alvo</strong> — a diferença no preço final vem de quatro fatores: (1) a <strong>taxa aplicada</strong> (comissão %) muda por marketplace e categoria; (2) alguns marketplaces cobram <strong>custos fixos extras</strong> por venda — taxa fixa por item na Shopee, ou frete obrigatório abaixo de R$79 no Mercado Livre; (3) o <strong>custo de transação</strong> (processamento de pagamento) só existe fora da comissão no Mercado Livre — cerca de 4,99% via Mercado Pago; na Shopee a taxa de transação já vem embutida na comissão (só entra por fora a taxa de campanha opcional de 2,5%, se ativada); (4) o marketplace com a maior soma desses custos precisa de um preço maior para sobrar a mesma margem no final.
        </p>
      </div>
    </div>
  )
}
