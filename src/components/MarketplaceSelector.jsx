import { useEffect, useMemo } from 'react'
import { getCondicoes, getMarketplaces, getCategoriasFor } from '../utils/storageUtils'

export default function MarketplaceSelector({ value, onChange, categoria, onCategoriaChange }) {
  const condicoes = useMemo(() => getCondicoes(), [])
  const marketplaces = useMemo(() => getMarketplaces(condicoes), [condicoes])
  const categorias = useMemo(() => getCategoriasFor(value, condicoes), [value, condicoes])

  // Quando troca de marketplace, ajusta a categoria selecionada
  useEffect(() => {
    if (categorias.length && !categorias.includes(categoria)) {
      onCategoriaChange?.(categorias[0])
    } else if (!categorias.length) {
      onCategoriaChange?.(null)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">1</span>
        Escolha o marketplace
      </h2>

      {/* Botões de marketplace */}
      <div className="flex flex-wrap gap-3">
        {marketplaces.map(mkt => {
          const selected = value === mkt.id
          return (
            <button
              key={mkt.id}
              type="button"
              onClick={() => onChange(mkt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${
                selected
                  ? 'border-ink-900 bg-ink-100 text-ink-950 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brass-300 hover:bg-brass-100/40'
              }`}
              aria-pressed={selected}
            >
              <span className="text-base">{mkt.emoji}</span>
              {mkt.label}
            </button>
          )
        })}
      </div>

      {/* Seletor de categoria — aparece para qualquer marketplace que tenha categorias */}
      {categorias.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria do produto
          </label>
          <select
            value={categoria || categorias[0]}
            onChange={e => onCategoriaChange?.(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-brass-400"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            As tarifas usadas são as configuradas em{' '}
            <a href="/configuracoes" className="text-brass-600 hover:underline">
              Condições Comerciais
            </a>.
          </p>
        </div>
      )}
    </div>
  )
}
