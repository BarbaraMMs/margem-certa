import { useState, useEffect, useRef, useMemo } from 'react'
import { AlertTriangle, Settings2, Save, Link2, MessageCircle, CheckCircle2, MessageSquare } from 'lucide-react'
import LandingHero from '../components/LandingHero'
import FeedbackSurvey from '../components/FeedbackSurvey'
import { trackProductCalculated } from '../utils/supabaseUtils'
import MarketplaceSelector from '../components/MarketplaceSelector'
import CostInputs from '../components/CostInputs'
import VariableSliders from '../components/VariableSliders'
import ResultCards from '../components/ResultCards'
import Diagnosis from '../components/Diagnosis'
import VolumeProjection from '../components/VolumeProjection'
import ScenarioSimulator from '../components/ScenarioSimulator'
import ExportButton from '../components/ExportButton'
import SimuladorFrete from '../components/SimuladorFrete'
import ComparativoMarketplaces from '../components/ComparativoMarketplaces'
import HowItWorks from './HowItWorks'
import { calcularPrecificacao } from '../utils/pricingLogic'
import { getCatalogo, getCondicoes, saveProduto, isFreePlan, passou90DiasDesdeAtualizacao, LIMITE_CATALOGO_FREE } from '../utils/storageUtils'

const DEFAULT_COSTS = {
  custoProduto: 35,
  freteAbsorvido: 8,
  outrosCustos: 0,
}

const DEFAULT_SLIDERS = {
  ads: 8,
  imposto: 6,
  devolucao: 1,
  margemAlvo: 15,
}

function parseQueryNumber(value) {
  if (!value) return null
  const num = parseFloat(value.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function readQueryParams() {
  const p = new URLSearchParams(window.location.search)
  const costs = {}
  const sliders = {}
  let marketplace = null
  let customFees = null

  if (p.get('mkt')) marketplace = p.get('mkt')
  if (p.get('custo')) costs.custoProduto = parseFloat(p.get('custo')) || DEFAULT_COSTS.custoProduto
  if (p.get('frete')) costs.freteAbsorvido = parseFloat(p.get('frete')) || DEFAULT_COSTS.freteAbsorvido
  if (p.get('outros')) costs.outrosCustos = parseFloat(p.get('outros')) || DEFAULT_COSTS.outrosCustos
  if (p.get('ads')) sliders.ads = parseFloat(p.get('ads')) || DEFAULT_SLIDERS.ads
  if (p.get('imp')) sliders.imposto = parseFloat(p.get('imp')) || DEFAULT_SLIDERS.imposto
  if (p.get('dev')) sliders.devolucao = parseFloat(p.get('dev')) || DEFAULT_SLIDERS.devolucao
  if (p.get('margem')) sliders.margemAlvo = parseFloat(p.get('margem')) || DEFAULT_SLIDERS.margemAlvo

  const feeClassico = parseQueryNumber(p.get('feeClassico'))
  const feePremium = parseQueryNumber(p.get('feePremium'))
  if (feeClassico !== null || feePremium !== null) {
    customFees = {
      classico: feeClassico !== null ? feeClassico / 100 : null,
      premium: feePremium !== null ? feePremium / 100 : null,
    }
  }

  return { costs, sliders, marketplace, customFees }
}

export default function Landing() {
  const query = useMemo(readQueryParams, [])

  const [marketplace, setMarketplace] = useState(query.marketplace || 'mercadolivre')
  const [categoria, setCategoria] = useState(null)
  const [costs, setCosts] = useState({ ...DEFAULT_COSTS, ...query.costs })
  const [sliders, setSliders] = useState({
    ...DEFAULT_SLIDERS,
    ...query.sliders,
  })
  const [unidades, setUnidades] = useState(50)
  const [nomeProduto, setNomeProduto] = useState('')
  const [modalSalvar, setModalSalvar] = useState(false)
  const [nomeSalvar, setNomeSalvar] = useState('')
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [customFees, setCustomFees] = useState(query.customFees)
  const [campanhaShopee, setCampanhaShopee] = useState(false)
  const [customFeeClassico, setCustomFeeClassico] = useState(query.customFees?.classico != null ? (query.customFees.classico * 100).toFixed(1) : '')
  const [customFeePremium, setCustomFeePremium] = useState(query.customFees?.premium != null ? (query.customFees.premium * 100).toFixed(1) : '')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Rastreia quando o usuário interagiu com a calculadora (mudou custos pelo menos 1x)
  const interactionCount = useRef(0)
  const feedbackShown = useRef(Boolean(localStorage.getItem('mc-feedback-shown')))

  // Dispara o survey de feedback automaticamente após 3 interações com a calculadora
  useEffect(() => {
    interactionCount.current += 1
    if (interactionCount.current >= 3 && !feedbackShown.current) {
      const timer = setTimeout(() => {
        if (!feedbackShown.current) {
          feedbackShown.current = true
          localStorage.setItem('mc-feedback-shown', '1')
          setShowFeedback(true)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [costs, sliders]) // eslint-disable-line react-hooks/exhaustive-deps

  const resultados = useMemo(() => {
    return calcularPrecificacao({
      ...costs,
      marketplace,
      categoria,
      ...sliders,
      customFees,
      campanhaShopee: marketplace === 'shopee' && campanhaShopee,
    })
  }, [costs, marketplace, categoria, sliders, customFees, campanhaShopee])

  const melhorDado = useMemo(() => {
    const cl = resultados?.classico
    const pr = resultados?.premium
    if (cl && !cl.error && cl.melhorOpcao) return cl
    if (pr && !pr.error && pr.melhorOpcao) return pr
    if (cl && !cl.error) return cl
    if (pr && !pr.error) return pr
    return null
  }, [resultados])

  const taxesOutdated = passou90DiasDesdeAtualizacao()
  const totalPctSemMargem = melhorDado
    ? melhorDado.detalheTaxas.taxaMarketplace
      + melhorDado.detalheTaxas.taxaTransacao
      + melhorDado.detalheTaxas.taxaCampanha
      + sliders.ads / 100 + sliders.imposto / 100 + sliders.devolucao / 100
    : 0

  return (
    <div>
      <LandingHero />

      {/* Calculadora */}
      <section id="calculadora" className="py-12 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-semibold text-ink-950 mb-1">Calculadora de Precificação</h2>
          <p className="text-gray-500 text-sm">Preencha os campos e veja o resultado em tempo real</p>
        </div>

        <div className="space-y-8">
          {taxesOutdated && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
              <p><strong>Atenção:</strong> as taxas de marketplace podem ter mudado. Revise suas configurações em "Condições Comerciais" para manter os cálculos precisos.</p>
            </div>
          )}
          {/* Passo 1 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <MarketplaceSelector
              value={marketplace}
              onChange={setMarketplace}
              categoria={categoria}
              onCategoriaChange={setCategoria}
            />
          </div>

          {/* Passo 2 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <CostInputs values={costs} onChange={setCosts} />
          </div>

          {/* Simulador de Frete (auxiliar do Passo 2) */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <SimuladorFrete
              marketplace={marketplace}
              precoIdealClassico={resultados?.classico?.precoIdeal ?? null}
              precoIdealPremium={resultados?.premium?.precoIdeal ?? null}
              onAplicarFrete={(valor) => setCosts(c => ({ ...c, freteAbsorvido: valor }))}
            />
          </div>

          {/* Condição comercial própria (auxiliar do Passo 2, opcional) */}
          <details className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <summary className="cursor-pointer flex items-center gap-2 mb-4">
              <Settings2 className="w-[18px] h-[18px] text-ink-900" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">Configurações avançadas (opcional)</span>
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="customFeeClassico" className="text-sm font-medium text-gray-700">
                  Taxa Clássico (%)
                </label>
                <input
                  id="customFeeClassico"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customFeeClassico}
                  onChange={(e) => {
                    const next = e.target.value
                    setCustomFeeClassico(next)
                    const value = parseFloat(next.replace(',', '.'))
                    setCustomFees((current) => ({
                      ...current,
                      classico: Number.isFinite(value) ? value / 100 : null,
                    }))
                  }}
                  placeholder="Ex: 13"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
                />
                <p className="text-xs text-gray-400">Use apenas como override temporário para o marketplace atual. A página de Condições Comerciais é a fonte principal de taxas padrão.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="customFeePremium" className="text-sm font-medium text-gray-700">
                  Taxa Premium (%)
                </label>
                <input
                  id="customFeePremium"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customFeePremium}
                  onChange={(e) => {
                    const next = e.target.value
                    setCustomFeePremium(next)
                    const value = parseFloat(next.replace(',', '.'))
                    setCustomFees((current) => ({
                      ...current,
                      premium: Number.isFinite(value) ? value / 100 : null,
                    }))
                  }}
                  placeholder="Ex: 18"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
                />
                <p className="text-xs text-gray-400">Se deixado em branco, o app usa a taxa padrão da página de Condições Comerciais.</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-brass-100 border border-brass-100 p-3 text-sm text-brass-700">
              <p className="font-semibold">Importante</p>
              <p>As taxas padrão devem ser editadas em Condições Comerciais. Este campo serve apenas para testes ou ajustes específicos.</p>
            </div>

            {marketplace === 'shopee' && (
              <label className="mt-4 flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campanhaShopee}
                  onChange={(e) => setCampanhaShopee(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Participo de campanhas de destaque da Shopee (11.11, Páscoa, etc.)
                  <span className="block text-xs text-gray-400">Adiciona +2,5% de taxa de campanha ao cálculo, cobrada sobre o preço de venda.</span>
                </span>
              </label>
            )}
          </details>

          {/* Passo 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-6">
            <VariableSliders values={sliders} onChange={setSliders} />
          </div>

          {/* Passo 4 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <ResultCards resultados={resultados} marketplace={marketplace} />
          </div>

          {/* Comparativo entre Marketplaces (auxiliar do Passo 4) */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <ComparativoMarketplaces
              costs={costs}
              sliders={sliders}
              condicoes={getCondicoes()}
              categoria={categoria}
              marketplace={marketplace}
              customFees={customFees}
              campanhaShopee={campanhaShopee}
            />
          </div>

          {/* Glossário rápido (auxiliar do Passo 4) */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Glossário rápido</h2>
                <p className="text-sm text-gray-500">Termos essenciais para entender sua margem.</p>
              </div>
              <button
                onClick={() => setShowGlossary((prev) => !prev)}
                className="text-sm font-semibold text-brass-600 hover:text-brass-700"
              >
                {showGlossary ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showGlossary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p className="font-semibold">Taxa de marketplace</p>
                  <p className="text-gray-500">Percentual retido pelo marketplace sobre o valor da venda.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Taxa de anúncio</p>
                  <p className="text-gray-500">Investimento em publicidade e promoção do produto.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Imposto</p>
                  <p className="text-gray-500">Estimativa de impostos ou encargos embutidos no preço.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Devolução</p>
                  <p className="text-gray-500">Percentual reservado para ressarcir devoluções e quebras.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Markup</p>
                  <p className="text-gray-500">Aumento do preço sobre o custo total fixo do produto.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Margem líquida</p>
                  <p className="text-gray-500">Porcentagem que sobra depois de todos os custos e taxas.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Custo fixo total</p>
                  <p className="text-gray-500">Soma de produto, frete absorvido e outros custos.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Condição própria</p>
                  <p className="text-gray-500">Override de taxa usado quando você tem acordo comercial diferenciado.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Clique em mostrar para ver os principais termos usados na calculadora.</p>
            )}
          </div>

          {/* Passo 5 — Diagnóstico */}
          {melhorDado && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">5</span>
                Diagnóstico automático
              </h2>
              <Diagnosis margemReal={melhorDado.margemReal} margemAlvo={sliders.margemAlvo} />
            </div>
          )}

          {/* Passo 6 */}
          {melhorDado && (
            <VolumeProjection
              lucroPorUnidade={melhorDado.lucroPorUnidade}
              precoIdeal={melhorDado.precoIdeal}
              onUnidadesChange={setUnidades}
            />
          )}

          {/* Passo 7 */}
          {melhorDado && (
            <ScenarioSimulator
              precoIdeal={melhorDado.precoIdeal}
              lucroPorUnidade={melhorDado.lucroPorUnidade}
              custoFixoTotal={melhorDado.custoFixoTotal}
              totalPctSemMargem={totalPctSemMargem}
              unidades={unidades}
            />
          )}

          {/* Export */}
          {melhorDado && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">8</span>
                Exportar e compartilhar
              </h2>
              <ExportButton
                nomeProduto={nomeProduto}
                setNomeProduto={setNomeProduto}
                marketplace={marketplace}
                resultados={resultados}
                costs={costs}
                sliders={sliders}
                unidades={unidades}
                categoria={categoria}
                customFees={customFees}
                campanhaShopee={campanhaShopee}
              />
              <div className="mt-3">
                <button
                  onClick={() => { setNomeSalvar(nomeProduto); setModalSalvar(true) }}
                  className="flex items-center gap-2 bg-white border border-ink-900 text-ink-900 hover:bg-ink-100 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" strokeWidth={2} /> Salvar produto no catálogo
                </button>
              </div>
            </div>
          )}

          {/* Modal salvar produto */}
          {modalSalvar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-1">Salvar produto</h3>
                <p className="text-xs text-gray-400 mb-4">Dê um nome para identificar este produto no catálogo.</p>
                <input
                  autoFocus
                  type="text"
                  value={nomeSalvar}
                  onChange={e => setNomeSalvar(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const currentCatalog = getCatalogo()
                      const isFree = isFreePlan()
                      if (isFree && currentCatalog.length >= LIMITE_CATALOGO_FREE) {
                        setShowUpgradeModal(true)
                        return
                      }
                      const produto = saveProduto({
                        nome: nomeSalvar.trim() || 'Produto sem nome',
                        marketplace,
                        categoria,
                        costs,
                        sliders,
                        customFees,
                        campanhaShopee: marketplace === 'shopee' && campanhaShopee,
                      })
                      trackProductCalculated({ nome: produto.nome, marketplace, precoIdeal: melhorDado?.precoIdeal })
                      setModalSalvar(false)
                      setSavedFeedback(true)
                      setTimeout(() => setSavedFeedback(false), 3000)
                    }
                    if (e.key === 'Escape') setModalSalvar(false)
                  }}
                  placeholder="Ex: Camiseta P azul — fornecedor X"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const currentCatalog = getCatalogo()
                      const isFree = isFreePlan()
                      if (isFree && currentCatalog.length >= LIMITE_CATALOGO_FREE) {
                        setShowUpgradeModal(true)
                        return
                      }
                      const produto = saveProduto({
                        nome: nomeSalvar.trim() || 'Produto sem nome',
                        marketplace,
                        categoria,
                        costs,
                        sliders,
                        customFees,
                        campanhaShopee: marketplace === 'shopee' && campanhaShopee,
                      })
                      trackProductCalculated({ nome: produto.nome, marketplace, precoIdeal: melhorDado?.precoIdeal })
                      setModalSalvar(false)
                      setSavedFeedback(true)
                      setTimeout(() => setSavedFeedback(false), 3000)
                    }}
                    className="flex-1 bg-ink-900 hover:bg-ink-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setModalSalvar(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast feedback de salvo */}
          {savedFeedback && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Produto salvo no catálogo!
              <a href="/catalogo" className="underline ml-1 hover:text-green-200">Ver catálogo →</a>
            </div>
          )}
        </div>
      </section>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recurso disponível no plano Pro</h3>
            <p className="text-sm text-gray-600 mb-4">
              O plano gratuito permite até 10 produtos no catálogo. Para salvar mais produtos e usar recursos avançados, atualize para o Pro.
            </p>
            <div className="space-y-3">
              <div className="rounded-2xl bg-brass-100 border border-brass-100 p-4 text-sm text-brass-700">
                <p className="font-semibold">Benefícios do Pro</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-brass-700">
                  <li>Salvar mais de 10 produtos</li>
                  <li>Exportar catálogo .xlsx</li>
                  <li>Condição comercial própria por produto</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/dashboard"
                  className="flex-1 bg-ink-900 hover:bg-ink-800 text-white font-semibold px-4 py-3 rounded-xl text-sm text-center"
                >
                  Quero saber mais
                </a>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeedback && <FeedbackSurvey onClose={() => setShowFeedback(false)} />}

      <HowItWorks />

      {/* CTA Final */}
      <section className="bg-ink-900 py-16 px-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-white mb-2">Gostou? Compartilhe com quem vende online.</h2>
        <p className="text-ink-100/80 mb-6 text-sm">Ajude outros sellers a precificarem com inteligência.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin)
            }}
            className="flex items-center gap-2 bg-white text-ink-900 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-ink-100 transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4" strokeWidth={2} /> Copiar link
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={2} /> Avaliar a ferramenta
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent('Calculei o preço ideal do meu produto com o MargemCerta. É gratuito e muito fácil de usar! ' + window.location.origin)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brass-600 hover:bg-brass-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} /> Compartilhar no WhatsApp
          </a>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-brass-600 rounded flex items-center justify-center">
            <span className="text-ink-950 font-bold text-xs">M</span>
          </div>
          <span className="text-white font-semibold">MargemCerta</span>
        </div>
        <p className="text-sm mb-1">Precifique certo. Lucre de verdade.</p>
        <p className="text-xs">Feito para sellers brasileiros 🇧🇷</p>
        <a href="mailto:contato@margemcerta.com.br" className="text-xs text-brass-600 hover:text-white mt-2 block">
          Enviar feedback
        </a>
      </footer>
    </div>
  )
}
