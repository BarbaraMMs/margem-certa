import { useState, Fragment } from 'react'
import { formatBRL, formatPct, getDiagnostico, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import MarginStamp from './MarginStamp'

function DetalhamentoTable({ dados }) {
  return (
    <div className="mt-4 rounded-2xl border border-brass-100 bg-gray-50 p-4 text-sm text-gray-700">
      {dados.faixaPrecoShopee && (
        <p className="mb-3 text-orange-700 font-medium">
          Faixa de preço Shopee aplicada: {dados.faixaPrecoShopee}
        </p>
      )}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Linha de custo</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">R$</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">%</span>
        {dados.detalheTaxas.itens.map((item, i) => (
          <Fragment key={i}>
            <span className="text-gray-600">{item.label}</span>
            <span className="font-data font-medium text-gray-800 text-right">{formatBRL(item.valor)}</span>
            <span className="font-data text-gray-500 text-right">{formatPct(item.valor / dados.precoIdeal)}</span>
          </Fragment>
        ))}
        <span className="font-semibold border-t border-gray-200 pt-2 mt-1">Preço ideal calculado</span>
        <span className="font-data font-semibold border-t border-gray-200 pt-2 mt-1 text-right">{formatBRL(dados.precoIdeal)}</span>
        <span className="font-data font-semibold border-t border-gray-200 pt-2 mt-1 text-right">100,0%</span>
      </div>
    </div>
  )
}

function ResultCard({ titulo, dados, destaque, margemAlvo }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!dados) return null

  if (dados.error) {
    return (
      <div className="flex-1 bg-card rounded-2xl border-2 border-red-200 p-6 shadow-md">
        <h3 className="text-base font-semibold text-gray-700 mb-2">{titulo}</h3>
        <p className="text-sm text-red-500">{dados.error}</p>
      </div>
    )
  }

  const diag = getDiagnostico(dados.margemReal, margemAlvo)

  return (
    <div className={`mc-card-anim relative flex-1 bg-card rounded-2xl border-2 p-6 shadow-[0_16px_40px_rgba(22,35,63,0.1)] transition-all
      ${destaque ? 'border-green-400 ring-2 ring-green-100' : 'border-brass-100'}`}>
      <MarginStamp nivel={diag.nivel} variant="cheio" />
      {destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ✓ Melhor opção
        </span>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-4">{titulo}</h3>
      <div className="space-y-3">
        <div className="flex flex-col gap-1 py-2 border-b border-brass-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Preço de venda ideal</span>
            <span className={`font-display ${destaque ? 'text-5xl font-black' : 'text-4xl font-black'} text-ink-900`}>{formatBRL(dados.precoIdeal)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Custo ajustado / (1 - total de taxas)</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Comissão do marketplace</span>
            <span className="font-data text-sm font-medium text-gray-700">{formatBRL(dados.feeEmReais)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal × taxa do marketplace</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Lucro por unidade</span>
            <span className={`font-data text-sm font-semibold ${dados.lucroPorUnidade >= 0 ? 'text-profit' : 'text-red-500'}`}>
              {formatBRL(dados.lucroPorUnidade)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal - custo ajustado - outras taxas</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Margem líquida real</span>
            <span className={`font-data text-sm font-bold ${dados.margemReal >= 0.05 ? 'text-profit' : 'text-red-500'}`}>
              {formatPct(dados.margemReal)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Lucro por unidade / preço ideal</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Markup total</span>
            <span className="font-data text-sm text-gray-700">{formatPct(dados.markup)}</span>
          </div>
          <p className="text-[11px] text-gray-400">(Preço ideal - custo total) / custo total</p>
        </div>
      </div>
      <button
        onClick={() => setShowDetails((prev) => !prev)}
        className="mt-5 w-full text-left text-sm font-medium text-brass-600 hover:text-brass-700"
      >
        {showDetails ? 'Ocultar' : 'Como chegamos neste preço'}
      </button>
      {showDetails && <DetalhamentoTable dados={dados} />}
    </div>
  )
}

export default function ResultCards({ resultados, marketplace, margemAlvo }) {
  if (!resultados) return null

  const temClassicoPremium = MARKETPLACES_COM_CLASSICO_PREMIUM.includes(marketplace)

  if (!temClassicoPremium) {
    const unico = resultados.classico?.melhorOpcao ? resultados.classico
      : resultados.premium?.melhorOpcao ? resultados.premium
      : resultados.classico || resultados.premium

    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">4</span>
          Resultado
        </h2>
        <ResultCard titulo="Preço ideal" dados={unico} destaque={false} margemAlvo={margemAlvo} />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">4</span>
        Resultado: Clássico vs Premium
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <ResultCard titulo="Anúncio Clássico" dados={resultados.classico} destaque={resultados.classico?.melhorOpcao} margemAlvo={margemAlvo} />
        <ResultCard titulo="Anúncio Premium" dados={resultados.premium} destaque={resultados.premium?.melhorOpcao} margemAlvo={margemAlvo} />
      </div>
    </div>
  )
}
