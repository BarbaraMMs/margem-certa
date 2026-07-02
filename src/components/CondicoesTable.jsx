import { useState, useMemo } from 'react'
import { BUILT_IN_LABELS, BUILT_IN_EMOJIS, getCustomLabels, saveCustomLabels } from '../utils/storageUtils'

function getLabel(key, customLabels) {
  return BUILT_IN_LABELS[key] || customLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getEmoji(key) {
  return BUILT_IN_EMOJIS[key] || '🏪'
}

const PctInput = ({ value, onChange }) => (
  <input
    type="number"
    min="0"
    max="100"
    step="0.1"
    defaultValue={(value * 100).toFixed(1)}
    key={(value * 100).toFixed(1)}
    onBlur={e => onChange(e.target.value)}
    className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400"
  />
)

export default function CondicoesTable({ condicoes, onChange }) {
  const [activeTab, setActiveTab] = useState('mercadolivre')
  const [newCatInputs, setNewCatInputs] = useState({})
  const [newCatErrors, setNewCatErrors] = useState({})
  const [showNewMkt, setShowNewMkt] = useState(false)
  const [newMktName, setNewMktName] = useState('')
  const [newMktError, setNewMktError] = useState('')
  const [customLabels, setCustomLabels] = useState(() => getCustomLabels())

  const marketplaces = useMemo(
    () => [...new Set(condicoes.map(r => r.marketplace))],
    [condicoes]
  )

  // ── Edição de linhas ───────────────────────────────────────────────────────

  function updateRow(idx, field, raw) {
    const val = parseFloat(String(raw).replace(',', '.'))
    if (isNaN(val) || val < 0 || val > 100) return
    onChange(condicoes.map((r, i) => i === idx ? { ...r, [field]: val / 100 } : r))
  }

  function removeRow(idx) {
    onChange(condicoes.filter((_, i) => i !== idx))
  }

  // ── Adicionar categoria ────────────────────────────────────────────────────

  function addCategory(mkt) {
    const nome = (newCatInputs[mkt] || '').trim()
    if (!nome) {
      setNewCatErrors(e => ({ ...e, [mkt]: 'Digite o nome da categoria.' }))
      return
    }
    if (condicoes.some(r => r.marketplace === mkt && r.categoria === nome)) {
      setNewCatErrors(e => ({ ...e, [mkt]: 'Essa categoria já existe.' }))
      return
    }
    onChange([...condicoes, { marketplace: mkt, categoria: nome, classico: 0.13, premium: 0.19 }])
    setNewCatInputs(i => ({ ...i, [mkt]: '' }))
    setNewCatErrors(e => ({ ...e, [mkt]: '' }))
  }

  // ── Adicionar marketplace personalizado ────────────────────────────────────

  function addMarketplace() {
    const name = newMktName.trim()
    if (!name) { setNewMktError('Digite o nome do marketplace.'); return }

    const key = name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    if (!key) { setNewMktError('Nome inválido.'); return }
    if (condicoes.some(r => r.marketplace === key)) {
      setNewMktError('Esse marketplace já existe.')
      return
    }

    const newLabels = { ...customLabels, [key]: name }
    setCustomLabels(newLabels)
    saveCustomLabels(newLabels)

    onChange([...condicoes, { marketplace: key, categoria: 'Geral', classico: 0.13, premium: 0.13 }])
    setNewMktName('')
    setNewMktError('')
    setShowNewMkt(false)
    setActiveTab(key)
  }

  // ── Remover marketplace personalizado ──────────────────────────────────────

  function removeMarketplace(mkt) {
    const updated = condicoes.filter(r => r.marketplace !== mkt)
    onChange(updated)
    const next = marketplaces.find(m => m !== mkt) || 'mercadolivre'
    setActiveTab(next)
  }

  const isBuiltIn = key => !!BUILT_IN_LABELS[key]

  return (
    <div>
      {/* ── Tabs de marketplaces ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {marketplaces.map(mkt => (
          <button
            key={mkt}
            onClick={() => setActiveTab(mkt)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
              activeTab === mkt
                ? 'border-green-500 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {getEmoji(mkt)} {getLabel(mkt, customLabels)}
          </button>
        ))}
        <button
          onClick={() => { setShowNewMkt(v => !v); setNewMktError('') }}
          className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-green-600 border-b-2 border-transparent -mb-px rounded-t-lg transition-colors"
          title="Adicionar marketplace personalizado"
        >
          + Novo
        </button>
      </div>

      {/* ── Formulário: novo marketplace ─────────────────────────────────── */}
      {showNewMkt && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-3">🏪 Adicionar marketplace personalizado</p>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-blue-700 font-medium mb-1 block">
                Nome do marketplace
              </label>
              <input
                type="text"
                value={newMktName}
                onChange={e => { setNewMktName(e.target.value); setNewMktError('') }}
                placeholder="ex: Shoptime, Via Varejo..."
                className="border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
                onKeyDown={e => e.key === 'Enter' && addMarketplace()}
              />
            </div>
            <button
              onClick={addMarketplace}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Criar
            </button>
            <button
              onClick={() => setShowNewMkt(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2"
            >
              Cancelar
            </button>
          </div>
          {newMktError && <p className="text-red-500 text-xs mt-2">{newMktError}</p>}
          <p className="text-xs text-blue-600 mt-2">
            Após criar, adicione as categorias e taxas na aba que será criada.
          </p>
        </div>
      )}

      {/* ── Conteúdo da aba ativa ────────────────────────────────────────── */}
      {marketplaces.map(mkt => {
        if (mkt !== activeTab) return null
        const rows = condicoes.filter(r => r.marketplace === mkt)

        return (
          <div key={mkt}>
            {/* Subtítulo + botão remover (apenas personalizados) */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                {rows.length === 0
                  ? 'Nenhuma categoria configurada. Adicione abaixo.'
                  : `${rows.length} categoria${rows.length !== 1 ? 's' : ''} configurada${rows.length !== 1 ? 's' : ''}`}
              </p>
              {!isBuiltIn(mkt) && (
                <button
                  onClick={() => removeMarketplace(mkt)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remover marketplace
                </button>
              )}
            </div>

            {/* Tabela de categorias */}
            {rows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
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
                    {rows.map(row => {
                      const globalIdx = condicoes.indexOf(row)
                      return (
                        <tr key={`${row.marketplace}-${row.categoria}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-800">
                            {row.categoria || (
                              <span className="text-gray-400 italic text-xs">Taxa geral</span>
                            )}
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
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => removeRow(globalIdx)}
                              className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
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
            )}

            {/* Adicionar categoria */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newCatInputs[mkt] || ''}
                onChange={e => {
                  setNewCatInputs(i => ({ ...i, [mkt]: e.target.value }))
                  setNewCatErrors(er => ({ ...er, [mkt]: '' }))
                }}
                placeholder={`Nova categoria — ${getLabel(mkt, customLabels)}...`}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-52 focus:outline-none focus:ring-2 focus:ring-green-400"
                onKeyDown={e => e.key === 'Enter' && addCategory(mkt)}
              />
              <button
                onClick={() => addCategory(mkt)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                + Adicionar
              </button>
              {newCatErrors[mkt] && (
                <span className="text-red-500 text-xs w-full">{newCatErrors[mkt]}</span>
              )}
            </div>
          </div>
        )
      })}

      {/* ── Caixa informativa ────────────────────────────────────────────── */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">💡 Como funciona</p>
        <p>
          Essas condições são a fonte principal para a calculadora e a importação em massa.
          Altere aqui sempre que tiver uma taxa diferente do padrão em qualquer marketplace/categoria.
        </p>
        <p>
          Para Shopee, Amazon e outros sem distinção Clássico/Premium, deixe os dois campos com o mesmo valor.
        </p>
        <p className="text-amber-600 font-medium">
          ⚠️ Os valores são estimativas. Verifique sempre as tarifas oficiais de cada marketplace antes de usar em produção.
        </p>
      </div>
    </div>
  )
}
