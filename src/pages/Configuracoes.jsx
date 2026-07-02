import { useState } from 'react'
import CondicoesTable from '../components/CondicoesTable'
import { getCondicoes, saveCondicoes, resetCondicoes, DEFAULT_CONDITIONS } from '../utils/storageUtils'

export default function Configuracoes() {
  const [condicoes, setCondicoes] = useState(() => getCondicoes())
  const [salvo, setSalvo] = useState(false)

  function handleSalvar() {
    saveCondicoes(condicoes)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  function handleReset() {
    const padrao = resetCondicoes()
    setCondicoes(padrao)
    setSalvo(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink-950 mb-1">Minhas Condições Comerciais</h1>
        <p className="text-gray-500 text-sm">
          Configure as taxas de comissão que os marketplaces cobram nas suas vendas.
          Essa página é a fonte principal de condições comerciais e será usada em toda a calculadora.
        </p>
      </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Verifique as taxas oficiais antes de usar em produção</p>
            <p>
              Os valores pré-preenchidos são estimativas de referência. As tarifas podem variar e são atualizadas pelo marketplace.{' '}
              <a
                href="https://www.mercadolivre.com.br/landing/custos-de-venda/tarifas-de-venda"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 underline font-medium"
              >
                Consulte a tabela oficial do Mercado Livre
              </a>.
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <CondicoesTable condicoes={condicoes} onChange={setCondicoes} />
        </div>

        {/* Ações */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSalvar}
            className="bg-ink-900 hover:bg-ink-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Salvar condições
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Restaurar padrões
          </button>
          {salvo && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Condições salvas com sucesso!
            </span>
          )}
        </div>
    </div>
  )
}
