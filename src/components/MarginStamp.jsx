const NIVEL_ESTILO = {
  saudavel: { texto: 'text-brass-100', label: 'APROVADO' },
  atencao:  { texto: 'text-amber-300', label: 'ATENÇÃO' },
  critico:  { texto: 'text-red-300',   label: 'REVISAR' },
}

/**
 * Selo de assinatura visual do MargemCerta — carimbo de tinta que reforça o
 * diagnóstico de margem já calculado por getDiagnostico() em pricingLogic.js.
 * variant="cheio": faixa diagonal de canto, para o card de resultado principal.
 *   O elemento pai PRECISA ter `relative` (position) — o wrapper abaixo se
 *   posiciona flush no canto (top-0 right-0) e recorta a própria faixa com
 *   `rounded-tr-2xl overflow-hidden`, para acompanhar o raio do card sem
 *   exigir `overflow-hidden` no card inteiro (isso importa porque alguns
 *   cards têm outros elementos, como o badge "Melhor opção", que precisam
 *   poder ultrapassar a borda do card — ver Task 3).
 * variant="discreto": tag inline compacta, para uso repetido em listas.
 */
export default function MarginStamp({ nivel, variant = 'discreto' }) {
  const estilo = NIVEL_ESTILO[nivel] || NIVEL_ESTILO.atencao

  if (variant === 'cheio') {
    return (
      <div className="absolute top-0 right-0 w-[110px] h-[110px] overflow-hidden rounded-tr-2xl pointer-events-none" aria-hidden="true">
        <div className={`mc-stamp-anim absolute top-5 -right-8 w-40 text-center py-1 text-[9.5px] font-bold tracking-[2px] shadow-md bg-ink-900 ${estilo.texto}`}>
          {estilo.label}
        </div>
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold tracking-wide -rotate-1 bg-ink-900 ${estilo.texto}`}>
      {estilo.label}
    </span>
  )
}
