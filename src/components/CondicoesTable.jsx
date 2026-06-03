import { useState } from 'react'

const MARKETPLACE_LABELS = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  amazon: 'Amazon',
  magalu: 'Magalu',
  americanas: 'Americanas',
}

export default function CondicoesTable({ condicoes, onChange }) {
  const [novaCategoria, setNovaCategoria] = useState('')
  const [erroNova, setErroNova] = useState('')

  function updateRow(idx, field, raw) {
    const val = parseFloat(raw.replace(',', '.'))
    if (isNaN(val) || val < 0 || val > 100) return
    const updated = condicoes.map((r, i) =>
      i === idx ? { ...r, [field]: val / 100 } : r
    )
    onChange(updated)
  }

  function removeRow(idx) {
    onChange(condicoes.filter((_, i) => i !== idx))
  }

  function addMLRow() {
    const nome = novaCategoria.trim()
    if (!nome) { setErroNova('Digite o nome da categoria.'); return }
    if (condicoes.some(r => r.marketplace === 'mercadolivre' && r.categoria === nome)) {
      setErroNova('Essa categoria já existe.')
      return
    }
    onChange([...condicoes, { marketplace: 'mercadolivre', categoria: nome, classico: 0.13, premium: 0.18 }])
    setNovaCategoria('')
    setErroNova('')
  }

  const mlRows = condicoes.filter(r => r.marketplace === 'mercadolivre')
  const otherRows = condicoes.filter(r => r.marketplace !== 'mercadolivre')

  const pct = v => (v * 100).toFixed(1)

  const PctInput = ({ value, onChange: onChg }) => (
    <input
      type="number"
      min="0"
      max="100"
      step="0.1"
      defaultValue={pct(value)}
      key={pct(value)}
      onBlur={e => onChg(e.target.value)}
      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  )

  return (
    <div className="space-y-8">
      {/* Mercado Livre */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Mercado Livre — por categoria</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-center">% Clássico</th>
                <th className="px-4 py-3 text-center">% Premium</th>
                <th className="px-4 py-3 text-center">Excluir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mlRows.map((row, idx) => {
                const globalIdx = condicoes.indexOf(row)
                return (
                  <tr key={row.categoria} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-800 font-medium">{row.categoria}</td>
                    <td className="px-4 py-2.5 text-center">
                      <PctInput
                        value={row.classico}
                        onChange={v => updateRow(globalIdx, 'classico', v)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PctInput
                        value={row.premium}
                        onChange={v => updateRow(globalIdx, 'premium', v)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => removeRow(globalIdx)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                        title="Excluir categoria"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Adicionar categoria ML */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={novaCategoria}
            onChange={e => { setNovaCategoria(e.target.value); setErroNova('') }}
            placeholder="Nova categoria do ML..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-green-400"
            onKeyDown={e => e.key === 'Enter' && addMLRow()}
          />
          <button
            onClick={addMLRow}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Adicionar
          </button>
          {erroNova && <span className="text-red-500 text-xs">{erroNova}</span>}
        </div>
      </div>

      {/* Outros marketplaces */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Outros marketplaces</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Marketplace</th>
                <th className="px-4 py-3 text-center">% Clássico</th>
                <th className="px-4 py-3 text-center">% Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {otherRows.map((row) => {
                const globalIdx = condicoes.indexOf(row)
                return (
                  <tr key={row.marketplace} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-800 font-medium">
                      {MARKETPLACE_LABELS[row.marketplace] || row.marketplace}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PctInput
                        value={row.classico}
                        onChange={v => updateRow(globalIdx, 'classico', v)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PctInput
                        value={row.premium}
                        onChange={v => updateRow(globalIdx, 'premium', v)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
