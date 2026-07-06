/**
 * VisitorModal.jsx
 * Modal de boas-vindas exibido na primeira visita à demo.
 * Coleta nome (obrigatório) e email (opcional) do potencial cliente.
 */
import { useState } from 'react'
import { X, Sparkles, Lock } from 'lucide-react'
import { registerVisitor, setLocalVisitorData } from '../utils/supabaseUtils'

export default function VisitorModal({ onClose }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Por favor, informe seu nome.'); return }
    setLoading(true)
    await registerVisitor({ name, email })
    setLoading(false)
    onClose({ name, email })
  }

  function handleSkip() {
    setLocalVisitorData({ id: null, name: 'Anônimo', email: '' })
    onClose({ name: 'Anônimo', email: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Header gradiente */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-7 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-wide uppercase opacity-90">
              Acesso à Demo
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Bem-vindo ao MargemCerta!
          </h2>
          <p className="mt-2 text-emerald-50 text-sm leading-relaxed">
            Antes de explorar a calculadora, nos conte quem você é.
            Assim podemos entender melhor como ajudar sellers como você.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Seu nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Ex.: João Silva"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                         placeholder:text-gray-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              E-mail{' '}
              <span className="text-gray-400 font-normal">(opcional — para te avisar quando lançarmos o Pro)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="joao@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                         placeholder:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-400">
              Seus dados não serão compartilhados. Usamos apenas para entender melhor nossos usuários.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
                         text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Registrando...' : 'Começar a usar a calculadora →'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-gray-400 hover:text-gray-600 text-xs py-1 transition-colors"
            >
              Prefiro explorar sem me identificar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
