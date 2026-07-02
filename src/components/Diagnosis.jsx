import { AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'
import { getDiagnostico } from '../utils/pricingLogic'

const COR_MAP = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    titulo: 'text-red-700',
    texto: 'text-red-600',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
    titulo: 'text-orange-700',
    texto: 'text-orange-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle2,
    titulo: 'text-green-700',
    texto: 'text-green-600',
  },
}

export default function Diagnosis({ margemReal, margemAlvo }) {
  if (margemReal === null || margemReal === undefined || isNaN(margemReal)) return null

  const diag = getDiagnostico(margemReal, margemAlvo)
  const c = COR_MAP[diag.cor]

  return (
    <div className={`rounded-xl border-2 p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <c.icon className={`w-5 h-5 mt-0.5 shrink-0 ${c.titulo}`} strokeWidth={2} />
        <div>
          <p className={`font-semibold ${c.titulo} mb-1`}>{diag.titulo} {diag.mensagem}</p>
          <p className={`flex items-start gap-1.5 text-sm ${c.texto}`}>
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
            {diag.acao}
          </p>
        </div>
      </div>
    </div>
  )
}
