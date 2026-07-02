import { useState } from 'react'
import { formatBRL, formatPct } from '../utils/pricingLogic'

function ResultCard({ tipo, dados, marketplace }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!dados) return null

  const label = tipo === 'classico' ? 'Clássico' : 'Premium'

  if (dados.error) {
    return (
      <div className="flex-1 bg-white rounded-2xl border-2 border-red-200 p-6 shadow-md">
        <h3 className="text-base font-semibold text-gray-700 mb-2">Anúncio {label}</h3>
        <p className="text-sm text-red-500">{dados.error}</p>
      </div>
    )
  }

  return (
    <div className={`flex-1 bg-white rounded-2xl border-2 p-6 shadow-md relative transition-all
      ${dados.melhorOpcao ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}>
      {dados.melhorOpcao && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ✓ Melhor opção
        </span>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-4">Anúncio {label}</h3>
      <div className="space-y-3">
        <div className="flex flex-col gap-1 py-2 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Preço de venda ideal</span>
            <span className={dados.melhorOpcao ? 'text-5xl font-bold text-green-700' : 'text-xl font-bold text-gray-900'}>{formatBRL(dados.precoIdeal)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Custo ajustado / (1 - total de taxas)</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Comissão do marketplace</span>
            <span className="text-sm font-medium text-gray-700">{formatBRL(dados.feeEmReais)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal × taxa do marketplace</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Lucro por unidade</span>
            <span className={`text-sm font-semibold ${dados.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatBRL(dados.lucroPorUnidade)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal - custo ajustado - outras taxas</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Margem líquida real</span>
            <span className={`text-sm font-bold ${dados.margemReal >= 0.05 ? 'text-green-600' : 'text-red-500'}`}>
              {formatPct(dados.margemReal)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Lucro por unidade / preço ideal</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Markup total</span>
            <span className="text-sm text-gray-700">{formatPct(dados.markup)}</span>
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
      {showDetails && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Taxa marketplace</span>
              <span>{formatPct(dados.detalheTaxas.taxaMarketplace)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de anúncio</span>
              <span>{formatPct(dados.detalheTaxas.taxaAds)}</span>
            </div>
            <div className="flex justify-between">
              <span>Imposto estimado</span>
              <span>{formatPct(dados.detalheTaxas.taxaImposto)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de devolução</span>
              <span>{formatPct(dados.detalheTaxas.taxaDevolucao)}</span>
            </div>
            <div className="flex justify-between">
              <span>Margem desejada</span>
              <span>{formatPct(dados.detalheTaxas.margemDesejada)}</span>
            </div>
            {dados.custoR6Aplicado && (
              <div className="flex justify-between text-orange-700">
                <span>Custo extra R$ 6 aplicado</span>
                <span>R$ 6,00</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <span>Preço ideal calculado</span>
              <span>{formatBRL(dados.precoIdeal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultCards({ resultados, marketplace }) {
  if (!resultados) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">4</span>
        Resultado: Clássico vs Premium
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <ResultCard tipo="classico" dados={resultados.classico} marketplace={marketplace} />
        <ResultCard tipo="premium" dados={resultados.premium} marketplace={marketplace} />
      </div>
    </div>
  )
}
