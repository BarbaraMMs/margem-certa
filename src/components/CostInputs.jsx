import FieldHelp from './FieldHelp'

function MoneyInput({ label, id, value, onChange, required }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseFloat(raw) / 100
    onChange(isNaN(num) ? 0 : num)
  }

  const display = value > 0
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : ''

  const hasError = required && (!value || value <= 0)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {label}
        <FieldHelp text={`Taxa e custo: ${label}`} />
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`flex items-center border-2 rounded-lg overflow-hidden bg-white transition-colors
        ${hasError ? 'border-red-400' : 'border-gray-200 focus-within:border-brass-400'}`}>
        <span className="px-3 py-2.5 text-gray-500 bg-gray-50 border-r border-gray-200 text-sm font-medium select-none">R$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder="0,00"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-white text-gray-900"
          aria-label={label}
        />
      </div>
      {hasError && (
        <p className="text-xs text-red-500">Campo obrigatório</p>
      )}
    </div>
  )
}

export default function CostInputs({ values, onChange }) {
  const set = (key) => (val) => onChange({ ...values, [key]: val })

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">2</span>
        Seus custos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MoneyInput
          label="Custo do produto"
          id="custoProduto"
          value={values.custoProduto}
          onChange={set('custoProduto')}
          required
        />
        <MoneyInput
          label="Custo de embalagem"
          id="custoEmbalagem"
          value={values.custoEmbalagem}
          onChange={set('custoEmbalagem')}
        />
        <MoneyInput
          label="Frete absorvido pelo seller"
          id="freteAbsorvido"
          value={values.freteAbsorvido}
          onChange={set('freteAbsorvido')}
        />
        <MoneyInput
          label="Outros custos fixos"
          id="outrosCustos"
          value={values.outrosCustos}
          onChange={set('outrosCustos')}
        />
      </div>
    </div>
  )
}
