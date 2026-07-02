import { useState } from 'react'
import { formatBRL, formatPct } from '../utils/pricingLogic'

export default function ScenarioSimulator({ precoIdeal, lucroPorUnidade, custoFixoTotal, totalPctSemMargem, unidades }) {
  const [precoSimulado, setPrecoSimulado] = useState('')

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseFloat(raw) / 100
    setPrecoSimulado(isNaN(num) ? '' : num)
  }

  const display = precoSimulado > 0
    ? precoSimulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : ''

  let simulacao = null
  if (precoSimulado > 0 && custoFixoTotal >= 0 && totalPctSemMargem >= 0) {
    const lucroReal = precoSimulado * (1 - totalPctSemMargem) - custoFixoTotal
    const margemReal = lucroReal / precoSimulado
    const diferenca = precoSimulado - (precoIdeal || 0)
    const lucroMensal = lucroReal * (unidades || 50)
    simulacao = { lucroReal, margemReal, diferenca, lucroMensal }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">7</span>
        Simulador de cenários
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
        <p className="text-sm text-gray-600 mb-4">Quero vender por quanto?</p>
        <div className="flex items-center border-2 border-gray-200 focus-within:border-brass-400 rounded-lg overflow-hidden bg-white max-w-xs mb-5 transition-colors">
          <span className="px-3 py-2.5 text-gray-500 bg-gray-50 border-r border-gray-200 text-sm font-medium select-none">R$</span>
          <input
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            placeholder="0,00"
            className="flex-1 px-3 py-2.5 text-sm outline-none bg-white text-gray-900"
            aria-label="Preço simulado de venda"
          />
        </div>

        {simulacao ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Lucro real</p>
              <p className={`font-bold text-base ${simulacao.lucroReal >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatBRL(simulacao.lucroReal)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Margem real</p>
              <p className={`font-bold text-base ${simulacao.margemReal >= 0.05 ? 'text-green-700' : 'text-red-600'}`}>
                {formatPct(simulacao.margemReal)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">vs. Preço ideal</p>
              <p className={`font-bold text-base ${simulacao.diferenca >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {simulacao.diferenca >= 0 ? '+' : ''}{formatBRL(simulacao.diferenca)}
              </p>
              <p className="text-xs text-gray-400">{simulacao.diferenca >= 0 ? 'acima' : 'abaixo'} do ideal</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Lucro mensal proj.</p>
              <p className={`font-bold text-base ${simulacao.lucroMensal >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatBRL(simulacao.lucroMensal)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Digite um preço para simular o cenário.</p>
        )}
      </div>
    </div>
  )
}
