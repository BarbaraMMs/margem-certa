const MARKETPLACES = [
  { id: 'mercadolivre', label: 'Mercado Livre', emoji: '🛒' },
  { id: 'shopee',       label: 'Shopee',        emoji: '🟠' },
  { id: 'amazon',       label: 'Amazon',        emoji: '📦' },
  { id: 'magalu',       label: 'Magalu',        emoji: '🛍️' },
  { id: 'americanas',   label: 'Americanas',    emoji: '🔴' },
]

export default function MarketplaceSelector({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">1</span>
        Escolha o marketplace
      </h2>
      <div className="flex flex-wrap gap-3">
        {MARKETPLACES.map((mkt) => {
          const selected = value === mkt.id
          return (
            <button
              key={mkt.id}
              type="button"
              onClick={() => onChange(mkt.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer
                ${selected
                  ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                }`}
              aria-pressed={selected}
            >
              <span className="text-base">{mkt.emoji}</span>
              {mkt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
