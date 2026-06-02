import { useState } from 'react'
import { formatBRL } from '../utils/pricingLogic'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function VolumeProjection({ lucroPorUnidade, precoIdeal, onUnidadesChange }) {
  const [unidades, setUnidades] = useState(50)

  const handleChange = (e) => {
    const v = parseInt(e.target.value)
    setUnidades(v)
    onUnidadesChange?.(v)
  }

  const faturamento = (precoIdeal || 0) * unidades
  const lucroMensal = (lucroPorUnidade || 0) * unidades
  const lucroAnual = lucroMensal * 12

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">6</span>
        Projeção por volume
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="unidades" className="text-sm font-medium text-gray-700">
              Unidades vendidas / mês
            </label>
            <span className="text-sm font-bold text-green-700">{unidades} un.</span>
          </div>
          <input
            id="unidades"
            type="range"
            min={10}
            max={500}
            step={10}
            value={unidades}
            onChange={handleChange}
            className="w-full"
            aria-label="Unidades vendidas por mês"
            aria-valuenow={unidades}
            aria-valuemin={10}
            aria-valuemax={500}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 un.</span>
            <span>500 un.</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <StatCard label="Faturamento / mês" value={formatBRL(faturamento)} />
          <StatCard label="Lucro líquido / mês" value={formatBRL(lucroMensal)} />
          <StatCard label="Lucro anual projetado" value={formatBRL(lucroAnual)} sub="baseado no volume atual" />
        </div>
      </div>
    </div>
  )
}
