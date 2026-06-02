import { formatBRL, formatPct } from '../utils/pricingLogic'

function ResultCard({ tipo, dados, marketplace }) {
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
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Preço de venda ideal</span>
          <span className="text-xl font-bold text-gray-900">{formatBRL(dados.precoIdeal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Fee do marketplace</span>
          <span className="text-sm font-medium text-gray-700">{formatBRL(dados.feeEmReais)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Lucro por unidade</span>
          <span className={`text-sm font-semibold ${dados.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatBRL(dados.lucroPorUnidade)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Margem líquida real</span>
          <span className={`text-sm font-bold ${dados.margemReal >= 0.05 ? 'text-green-600' : 'text-red-500'}`}>
            {formatPct(dados.margemReal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Markup sobre produto</span>
          <span className="text-sm text-gray-700">{formatPct(dados.markup)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ResultCards({ resultados, marketplace }) {
  if (!resultados) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">4</span>
        Resultado: Clássico vs Premium
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <ResultCard tipo="classico" dados={resultados.classico} marketplace={marketplace} />
        <ResultCard tipo="premium" dados={resultados.premium} marketplace={marketplace} />
      </div>
    </div>
  )
}
