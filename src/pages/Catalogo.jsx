import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageOpen, Pencil, Trash2, Lock } from 'lucide-react'
import { getCatalogo, deleteProduto, saveProduto, isFreePlan, LIMITE_CATALOGO_FREE } from '../utils/storageUtils'
import { calcularMelhorOferta, formatBRL, formatPct } from '../utils/pricingLogic'
import { getMarketplaceEmoji, getMarketplaceLabel } from '../utils/storageUtils'
import { exportarCatalogoXLSX } from '../utils/exportUtils'
import ProGateModal from '../components/ProGateModal'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function formatData(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return `${String(d.getDate()).padStart(2, '0')} ${MESES_ABREV[d.getMonth()]} ${d.getFullYear()}`
}

function corMargem(margemReal) {
  const pct = margemReal * 100
  if (pct >= 20) return 'text-green-600'
  if (pct >= 10) return 'text-yellow-600'
  return 'text-red-500'
}

export default function Catalogo() {
  const navigate = useNavigate()
  const [catalogo, setCatalogo] = useState(() => getCatalogo())
  const [editandoId, setEditandoId] = useState(null)
  const [nomeEdit, setNomeEdit] = useState('')
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const free = isFreePlan()

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
      feeClassico: produto.customFees?.classico != null ? produto.customFees.classico * 100 : undefined,
      feePremium: produto.customFees?.premium != null ? produto.customFees.premium * 100 : undefined,
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

  function handleExportCatalog() {
    if (free) {
      setShowUpgradeModal(true)
      return
    }
    exportarCatalogoXLSX(catalogo)
  }

  return (
    <>
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-950">Meu Catálogo</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-sm">{catalogo.length} produtos salvos</p>
              {free && catalogo.length > 7 && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  catalogo.length >= LIMITE_CATALOGO_FREE ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {catalogo.length}/{LIMITE_CATALOGO_FREE} produtos
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleExportCatalog}
            title={free ? 'Exportação disponível no plano Pro' : undefined}
            className={`font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 ${
              free
                ? 'bg-ink-900 text-white opacity-50 cursor-not-allowed'
                : 'bg-ink-900 hover:bg-ink-800 text-white cursor-pointer'
            }`}
          >
            {free && <Lock className="w-4 h-4" strokeWidth={2} />} Exportar catálogo (.xlsx)
          </button>
        </div>

        {free && catalogo.length >= LIMITE_CATALOGO_FREE && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>Você atingiu o limite do plano gratuito. Faça upgrade para o Pro e adicione produtos ilimitados.</p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Ver plano Pro
            </button>
          </div>
        )}

        {catalogo.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
            <PackageOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-gray-600 font-medium mb-1">Nenhum produto salvo ainda.</p>
            <p className="text-gray-400 text-sm mb-5">Calcule o preço de um produto e salve aqui para acompanhar sua margem.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-ink-900 hover:bg-ink-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Calcular meu primeiro produto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogo.map(produto => {
              const melhor = calcularMelhorOferta(produto)
              const emoji = getMarketplaceEmoji(produto.marketplace)
              const label = getMarketplaceLabel(produto.marketplace)
              const estaEditando = editandoId === produto.id
              const estaConfirmando = confirmandoId === produto.id

              return (
                <div key={produto.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
                  {estaEditando ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={nomeEdit}
                        onChange={e => setNomeEdit(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSalvarNome(produto); if (e.key === 'Escape') setEditandoId(null) }}
                        className="border border-brass-400 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brass-300 w-full"
                      />
                      <button onClick={() => handleSalvarNome(produto)} className="text-xs bg-ink-900 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-ink-800 cursor-pointer shrink-0">Salvar</button>
                      <button onClick={() => setEditandoId(null)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer shrink-0">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-800 truncate flex-1">{produto.nome || 'Produto sem nome'}</h2>
                      <button
                        onClick={() => handleEditar(produto)}
                        className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                        title="Renomear"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  )}

                  {melhor ? (
                    <>
                      <p className="text-xl font-bold text-green-700">{formatBRL(melhor.precoIdeal)}</p>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-semibold ${corMargem(melhor.margemReal)}`}>
                          Margem real: {formatPct(melhor.margemReal)}
                        </p>
                        <p className={`text-sm font-medium ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          Lucro/un.: {formatBRL(melhor.lucroPorUnidade)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-red-400">Erro ao calcular</p>
                  )}

                  <p className="text-xs text-gray-400">
                    {emoji} {label}
                    {produto.categoria ? ` · ${produto.categoria}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">Salvo em {formatData(produto.criadoEm || produto.atualizadoEm)}</p>
                  {produto.customFees && (
                    <span className="inline-flex w-fit items-center rounded-full bg-brass-100 text-brass-700 px-2.5 py-1 text-[11px] font-semibold">
                      Condição própria
                    </span>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleCalcular(produto)}
                      className="bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                    >
                      Recalcular
                    </button>
                    {estaConfirmando ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Tem certeza?</span>
                        <button
                          onClick={() => handleDeletar(produto.id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-2.5 rounded-lg font-semibold cursor-pointer min-h-[44px]"
                        >Sim</button>
                        <button
                          onClick={() => setConfirmandoId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer min-h-[44px]"
                        >Não</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoId(produto.id)}
                        className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs font-medium px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
      {showUpgradeModal && (
        <ProGateModal
          recurso="Exportar catálogo em XLSX"
          descricao="Exporte todos os produtos do seu catálogo em uma planilha .xlsx a qualquer momento e salve produtos ilimitados."
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  )
}
