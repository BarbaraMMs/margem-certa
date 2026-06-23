import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCatalogo, deleteProduto, saveProduto } from '../utils/storageUtils'
import { calcularPrecificacao, formatBRL, formatPct } from '../utils/pricingLogic'
import { getMarketplaceEmoji, getMarketplaceLabel } from '../utils/storageUtils'

function calcularMelhor(produto) {
  const res = calcularPrecificacao({
    ...produto.costs,
    marketplace: produto.marketplace,
    categoria: produto.categoria || null,
    ...produto.sliders,
  })
  const cl = res?.classico
  const pr = res?.premium
  if (cl && pr && !cl.error && !pr.error) {
    return cl.margemReal >= pr.margemReal ? cl : pr
  }
  if (cl && !cl.error) return cl
  if (pr && !pr.error) return pr
  return null
}

function formatData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Catalogo() {
  const navigate = useNavigate()
  const [catalogo, setCatalogo] = useState(() => getCatalogo())
  const [editandoId, setEditandoId] = useState(null)
  const [nomeEdit, setNomeEdit] = useState('')
  const [confirmandoId, setConfirmandoId] = useState(null)

  const refresh = useCallback(() => setCatalogo(getCatalogo()), [])

  function handleCalcular(produto) {
    const p = new URLSearchParams({
      mkt: produto.marketplace,
      custo: produto.costs.custoProduto,
      emb: produto.costs.custoEmbalagem,
      frete: produto.costs.freteAbsorvido,
      outros: produto.costs.outrosCustos,
      ads: produto.sliders.ads,
      imp: produto.sliders.imposto,
      dev: produto.sliders.devolucao,
      margem: produto.sliders.margemAlvo,
    })
    navigate(`/?${p.toString()}`)
  }

  function handleEditar(produto) {
    setEditandoId(produto.id)
    setNomeEdit(produto.nome)
  }

  function handleSalvarNome(produto) {
    if (!nomeEdit.trim()) return
    saveProduto({ ...produto, nome: nomeEdit.trim() })
    refresh()
    setEditandoId(null)
  }

  function handleDeletar(id) {
    deleteProduto(id)
    refresh()
    setConfirmandoId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Salve seus produtos aqui para não precisar redigitar os dados toda vez. Quando os custos mudarem (fornecedor, embalagem, frete), recalcule todos de uma vez.
          </p>
        </div>

        {catalogo.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-600 font-medium mb-1">Nenhum produto salvo ainda</p>
            <p className="text-gray-400 text-sm mb-5">Use o botão "Salvar produto" na calculadora para começar.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Ir para a calculadora →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {catalogo.map(produto => {
              const melhor = calcularMelhor(produto)
              const emoji = getMarketplaceEmoji(produto.marketplace)
              const label = getMarketplaceLabel(produto.marketplace)
              const estaEditando = editandoId === produto.id
              const estaConfirmando = confirmandoId === produto.id

              return (
                <div key={produto.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      {estaEditando ? (
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            autoFocus
                            type="text"
                            value={nomeEdit}
                            onChange={e => setNomeEdit(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSalvarNome(produto); if (e.key === 'Escape') setEditandoId(null) }}
                            className="border border-green-400 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 w-full max-w-xs"
                          />
                          <button onClick={() => handleSalvarNome(produto)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 cursor-pointer">Salvar</button>
                          <button onClick={() => setEditandoId(null)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-semibold text-gray-800 truncate">{produto.nome || 'Produto sem nome'}</h2>
                          <button
                            onClick={() => handleEditar(produto)}
                            className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                            title="Renomear"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        {emoji} {label}
                        {produto.categoria ? ` · ${produto.categoria}` : ''}
                        {' · Salvo em '}{formatData(produto.atualizadoEm)}
                      </p>
                    </div>

                    {/* Resultado calculado ao vivo */}
                    {melhor ? (
                      <div className="flex gap-6 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Preço ideal</p>
                          <p className="font-bold text-gray-800">{formatBRL(melhor.precoIdeal)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Margem</p>
                          <p className={`font-bold ${melhor.margemReal >= 0.05 ? 'text-green-600' : 'text-red-500'}`}>
                            {formatPct(melhor.margemReal)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Lucro/un.</p>
                          <p className={`font-semibold ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {formatBRL(melhor.lucroPorUnidade)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400">Erro ao calcular</p>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCalcular(produto)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Calcular
                      </button>
                      {estaConfirmando ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Confirmar?</span>
                          <button
                            onClick={() => handleDeletar(produto.id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-semibold cursor-pointer"
                          >Sim</button>
                          <button
                            onClick={() => setConfirmandoId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >Não</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmandoId(produto.id)}
                          className="text-gray-400 hover:text-red-500 text-xs font-medium px-2 py-2 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
