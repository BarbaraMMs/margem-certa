import { REGIMES, getDescricaoRegime } from '../utils/tributarioUtils'
import { setRegimeTributario } from '../utils/storageUtils'
import FieldHelp from './FieldHelp'

const TOOLTIPS = {
  [REGIMES.MEI]: 'Microempreendedor Individual — paga um DAS mensal fixo, não um percentual por venda. Usamos ~5% como referência para cobrir o DAS no preço.',
  [REGIMES.SIMPLES]: 'Regime simplificado para pequenas e médias empresas, com alíquota progressiva conforme o faturamento. Usamos ~7,5% como referência média.',
  [REGIMES.PRESUMIDO]: 'Carga tributária aproximada de 11,4% sobre o faturamento (PIS + COFINS + IRPJ + CSLL).',
  [REGIMES.REAL]: 'Alíquota variável conforme o resultado da empresa. Usamos ~15% como referência — consulte seu contador.',
}

export default function RegimeTributarioSelector({ value, onChange }) {
  function handleSelect(regime) {
    setRegimeTributario(regime)
    onChange(regime)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Regime tributário</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.values(REGIMES).map((regime) => {
          const selecionado = value === regime
          return (
            <button
              key={regime}
              type="button"
              onClick={() => handleSelect(regime)}
              aria-pressed={selecionado}
              className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                selecionado
                  ? 'bg-ink-900 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getDescricaoRegime(regime)}
              <FieldHelp text={TOOLTIPS[regime]} />
            </button>
          )
        })}
      </div>
      {TOOLTIPS[value] && (
        <p className="mt-2 text-xs text-gray-500">{TOOLTIPS[value]}</p>
      )}
    </div>
  )
}
