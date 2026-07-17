/**
 * FeedbackSurvey.jsx
 * Survey exploratória exibida após o usuário interagir com a calculadora.
 * Coleta percepções sobre gestão de preços/lucro e avalia a ferramenta.
 */
import { useState } from 'react'
import { Star, ChevronRight, ChevronLeft, CheckCircle2, X, MessageSquare } from 'lucide-react'
import { saveFeedback } from '../utils/supabaseUtils'

const STEPS = ['pesquisa', 'avaliacao', 'obrigado']

const HELPED_OPTIONS = [
  { value: 'sim',           label: '✅ Sim, ficou muito mais claro!' },
  { value: 'parcialmente',  label: '🤔 Parcialmente — ainda tenho dúvidas' },
  { value: 'não',           label: '😐 Não muito, preciso entender melhor' },
]

export default function FeedbackSurvey({ onClose }) {
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 0 — pesquisa exploratória
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')

  // Step 1 — avaliação da ferramenta
  const [helped,  setHelped]  = useState('')
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  async function handleSubmit() {
    setLoading(true)
    await saveFeedback({ q1, q2, q3, helped, rating, comment })
    setLoading(false)
    setStep(2) // obrigado
  }

  // ── Step: Pesquisa ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <Overlay>
        <Header
          badge="Pesquisa rápida • 3 perguntas"
          title="Nos conte sobre sua rotina como seller"
          subtitle="Leva menos de 2 minutos. Suas respostas são anônimas e nos ajudam a melhorar o MargemCerta."
          onClose={onClose}
        />
        <div className="px-8 py-6 space-y-5">
          <Textarea
            label='💡 Como você descobre se está tendo lucro ou prejuízo nas suas vendas hoje?'
            value={q1}
            onChange={setQ1}
            placeholder="Ex.: Faço na planilha, no caderninho, no chute mesmo..."
          />
          <Textarea
            label='😬 Já perdeu dinheiro em alguma venda? O que aconteceu?'
            value={q2}
            onChange={setQ2}
            placeholder="Ex.: Esqueci de incluir o frete, não calculei a taxa do marketplace..."
          />
          <Textarea
            label='🔢 Me conta da última vez que você calculou o preço de um produto.'
            value={q3}
            onChange={setQ3}
            placeholder="Ex.: Peguei o custo e coloquei 30% em cima, sem pensar nas taxas..."
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium
                         py-2.5 rounded-xl transition-colors text-sm"
            >
              Pular
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-ink-900 hover:bg-ink-800 text-white font-semibold
                         py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Progress current={1} total={2} />
        </div>
      </Overlay>
    )
  }

  // ── Step: Avaliação ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <Overlay>
        <Header
          badge="Avaliação da ferramenta"
          title="O MargemCerta te ajudou?"
          subtitle="Sua opinião é o que guia o desenvolvimento do produto."
          onClose={onClose}
        />
        <div className="px-8 py-6 space-y-6">

          {/* Helped question */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              🎯 A ferramenta te ajudou a ter uma visão mais clara dos seus custos e margem?
            </p>
            <div className="space-y-2">
              {HELPED_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setHelped(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                    ${helped === opt.value
                      ? 'border-ink-900 bg-brass-100/40 text-ink-950'
                      : 'border-gray-200 hover:border-brass-300 text-gray-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ⭐ Qual nota você daria para o MargemCerta?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      n <= (hovered || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500 self-center ml-2">
                  {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente!'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Free comment */}
          <Textarea
            label='💬 Deixe um comentário ou sugestão (opcional)'
            value={comment}
            onChange={setComment}
            placeholder="O que você gostou? O que poderia melhorar? Alguma funcionalidade que sente falta?"
            rows={3}
          />

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50
                         font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (!helped && !rating)}
              className="flex-1 bg-ink-900 hover:bg-ink-800 disabled:opacity-50
                         text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Enviando...' : 'Enviar avaliação 🚀'}
            </button>
          </div>
          <Progress current={2} total={2} />
        </div>
      </Overlay>
    )
  }

  // ── Step: Obrigado ──────────────────────────────────────────────────────────
  return (
    <Overlay>
      <div className="px-8 py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Muito obrigada! 🙏</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Seu feedback é valioso e vai nos ajudar a construir o melhor produto para sellers brasileiros.
          Assim que lançarmos novas funcionalidades, você será um dos primeiros a saber!
        </p>
        <button
          onClick={onClose}
          className="bg-ink-900 hover:bg-ink-800 text-white font-semibold
                     px-8 py-3 rounded-xl transition-colors text-sm"
        >
          Continuar explorando
        </button>
      </div>
    </Overlay>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function Header({ badge, title, subtitle, onClose }) {
  return (
    <div className="bg-gradient-to-br from-ink-900 to-ink-700 px-8 py-6 text-white relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 opacity-80" />
        <span className="text-xs font-semibold tracking-wide uppercase opacity-80">{badge}</span>
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-ink-100/70 text-sm">{subtitle}</p>
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                   focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent
                   placeholder:text-gray-400"
      />
    </div>
  )
}

function Progress({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < current ? 'bg-brass-600' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="text-xs text-gray-400 whitespace-nowrap">{current}/{total}</span>
    </div>
  )
}
