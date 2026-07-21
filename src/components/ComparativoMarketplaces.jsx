import { useMemo } from 'react'
import { Scale, Info } from 'lucide-react'
import { calcularPrecificacao, formatBRL, formatPct, getDiagnostico, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import { getMarketplaces, getCondicoes } from '../utils/storageUtils'
import MarketplaceIcon from './MarketplaceIcon'
import MarginStamp from './MarginStamp'

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {linhas.map(({ mkt, melhor, tipo }, i) => {
          const isMelhor = i === 0
          const custosFixosExtras = (melhor.detalheTaxas.taxaFixaReais || 0) + (melhor.detalheTaxas.freteCoParticipacaoReais || 0)
          const custoTransacao = ((melhor.detalheTaxas.taxaTransacao || 0) + (melhor.detalheTaxas.taxaCampanha || 0)) * melhor.precoIdeal
          const diag = getDiagnostico(melhor.margemReal, sliders.margemAlvo)

          return (
            <div
              key={mkt.id}
              className={`rounded-2xl border p-4 shadow-[0_16px_40px_rgba(22,35,63,0.06)] bg-card ${isMelhor ? 'border-brass-400 ring-2 ring-brass-100' : 'border-brass-100'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-gray-800 inline-flex items-center gap-2">
                  <MarketplaceIcon marketplace={mkt.id} sizePx={18} />
                  {mkt.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isMelhor && (
                    <span className="text-[10px] bg-brass-100 text-brass-800 px-2 py-0.5 rounded-full font-bold">★ Melhor</span>
                  )}
                  <MarginStamp nivel={diag.nivel} variant="discreto" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Anúncio</p>
                  <p className="font-data font-medium text-gray-700">{tipo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Taxa aplicada</p>
                  <p className="font-data font-medium text-gray-700">{formatPct(melhor.detalheTaxas.taxaMarketplace)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custos fixos extras</p>
                  <p className="font-data font-medium text-gray-700">
                    {custosFixosExtras > 0 ? formatBRL(custosFixosExtras) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custo de transação</p>
                  <p className="font-data font-medium text-gray-700">
                    {custoTransacao > 0 ? formatBRL(custoTransacao) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Preço ideal</p>
                  <p className="font-data font-semibold text-gray-800">{formatBRL(melhor.precoIdeal)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Margem</p>
                  <p className="font-data font-bold text-gray-800">{formatPct(melhor.margemReal)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-400 text-xs">Lucro / un.</span>
                <span className={`font-data font-semibold text-sm ${melhor.lucroPorUnidade >= 0 ? 'text-profit' : 'text-red-500'}`}>
                  {formatBRL(melhor.lucroPorUnidade)}
                </span>
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
