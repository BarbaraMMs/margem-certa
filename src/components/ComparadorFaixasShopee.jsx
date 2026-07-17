import { useMemo } from 'react'
import { Layers, Info } from 'lucide-react'
import { compararFaixasShopee, formatBRL, formatPct } from '../utils/pricingLogic'

export default function ComparadorFaixasShopee({ custoFixoTotalBase, ads, imposto, devolucao, customFees, campanhaShopee, faixaAtual }) {
  const faixas = useMemo(() => {
    const comissaoOverride = customFees && Number.isFinite(customFees.classico) ? customFees.classico : null
    return compararFaixasShopee({ custoFixoTotalBase, ads, imposto, devolucao, comissaoOverride, campanhaShopee })
  }, [custoFixoTotalBase, ads, imposto, devolucao, customFees, campanhaShopee])

  if (!faixas.length) return null

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900">
          <Layers className="w-4 h-4" strokeWidth={2} />
        </span>
        Comparador de faixas de preço — Shopee
      </h2>
      <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-4 ml-9">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
        A Shopee cobra comissão maior nas faixas de preço mais baixas, mas taxa fixa bem menor. Veja a margem resultante se você travar o preço no teto de cada faixa — às vezes compensa ficar na faixa mais barata em vez de deixar o preço subir.
      </p>

      {/* Tabela desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-semibold">Faixa de preço</th>
              <th className="text-right px-4 py-3 font-semibold">Comissão</th>
              <th className="text-right px-4 py-3 font-semibold">Taxa fixa por item</th>
              <th className="text-right px-4 py-3 font-semibold">Preço de referência</th>
              <th className="text-right px-4 py-3 font-semibold">Margem resultante</th>
              <th className="text-right px-4 py-3 font-semibold">Lucro / un.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faixas.map(({ tier, preco, margem, lucro }) => {
              const isAtual = tier.label === faixaAtual
              const custosFixosExtras = tier.taxaFixa + tier.freteCoParticipacao
              return (
                <tr
                  key={tier.label}
                  className={`transition-colors ${isAtual ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {tier.label}
                    {isAtual && <span className="ml-2 text-xs font-semibold text-green-600">atual</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatPct(tier.comissao)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatBRL(custosFixosExtras)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {tier.max === Infinity ? 'a partir de ' : 'até '}{formatBRL(preco)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {margem == null ? (
                      '—'
                    ) : (
                      <span className={`font-bold ${margem < 0.05 ? 'text-red-500' : 'text-gray-700'}`}>
                        {formatPct(margem)}
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${lucro == null ? 'text-gray-400' : lucro >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {lucro == null ? '—' : formatBRL(lucro)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="sm:hidden space-y-3">
        {faixas.map(({ tier, preco, margem, lucro }) => {
          const isAtual = tier.label === faixaAtual
          const custosFixosExtras = tier.taxaFixa + tier.freteCoParticipacao
          return (
            <div
              key={tier.label}
              className={`rounded-xl border p-4 ${isAtual ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-800">{tier.label}</span>
                {isAtual && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">Atual</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Comissão</p>
                  <p className="font-medium text-gray-700">{formatPct(tier.comissao)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Taxa fixa por item</p>
                  <p className="font-medium text-gray-700">{formatBRL(custosFixosExtras)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Preço de referência</p>
                  <p className="font-semibold text-gray-800">
                    {tier.max === Infinity ? 'a partir de ' : 'até '}{formatBRL(preco)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Margem resultante</p>
                  <p className={`font-bold ${margem == null ? 'text-gray-400' : margem < 0.05 ? 'text-red-500' : 'text-gray-700'}`}>
                    {margem == null ? '—' : formatPct(margem)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Lucro / un.</p>
                  <p className={`font-medium ${lucro == null ? 'text-gray-400' : lucro >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {lucro == null ? '—' : formatBRL(lucro)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        "Preço de referência" é o teto de cada faixa (ou o piso, na faixa sem teto). A margem mostrada é a que sobra se você vender exatamente nesse preço — não é o preço ideal calculado para a margem alvo.
      </p>
    </div>
  )
}
