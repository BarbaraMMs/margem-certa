import { useMemo } from 'react'
import { Scale, Info } from 'lucide-react'
import { calcularPrecificacao, formatBRL, formatPct } from '../utils/pricingLogic'
import { getMarketplaces, getCondicoes } from '../utils/storageUtils'

export default function ComparativoMarketplaces({ costs, sliders, condicoes, categoria, marketplace, customFees }) {
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

        return { mkt, melhor, tipo }
      })
      .filter(l => l.melhor != null)
      .sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)
  }, [costs, sliders, condicoesAtivas, categoria, marketplace, customFees])

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
              <th className="text-right px-4 py-3 font-semibold">Preço ideal</th>
              <th className="text-right px-4 py-3 font-semibold">Margem</th>
              <th className="text-right px-4 py-3 font-semibold">Lucro / un.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linhas.map(({ mkt, melhor, tipo }, i) => {
              const isMelhor = melhor.margemReal === melhorMargem && i === 0
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
    </div>
  )
}
