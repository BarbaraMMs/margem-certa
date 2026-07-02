import FieldHelp from './FieldHelp'

function SliderRow({ label, id, value, onChange, min, max, step = 0.5, suffix = '%', disabled = false }) {
  const handleInput = (e) => {
    if (disabled) return
    const v = parseFloat(e.target.value)
    if (!isNaN(v) && v >= min && v <= max) onChange(v)
  }

  const handleText = (e) => {
    if (disabled) return
    const v = parseFloat(e.target.value.replace(',', '.'))
    if (!isNaN(v) && v >= min && v <= max) onChange(v)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleText}
            readOnly={disabled}
            className={`w-16 text-right text-sm font-semibold border rounded-md px-2 py-0.5 outline-none ${
              disabled
                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'text-green-700 border-gray-200 focus:border-green-400'
            }`}
            aria-label={`Valor de ${label}`}
          />
          <span className="text-sm text-gray-500">{suffix}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInput}
        disabled={disabled}
        className={`w-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}

export default function VariableSliders({ values, onChange }) {
  const set = (key) => (val) => onChange({ ...values, [key]: val })

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">3</span>
        Custos variáveis
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SliderRow label="Ads / Patrocínio" id="ads" value={values.ads} onChange={set('ads')} min={0} max={30} />
        <SliderRow
          label={<>Imposto <FieldHelp text="Percentual estimado de imposto sobre o faturamento. Preenchido automaticamente pelo regime tributário selecionado acima." /></>}
          id="imposto"
          value={values.imposto}
          onChange={set('imposto')}
          min={0}
          max={20}
        />
        <SliderRow label="Devolução / Quebra" id="devolucao" value={values.devolucao} onChange={set('devolucao')} min={0} max={10} />
        <SliderRow label="Margem líquida alvo" id="margemAlvo" value={values.margemAlvo} onChange={set('margemAlvo')} min={5} max={60} />
      </div>
    </div>
  )
}
