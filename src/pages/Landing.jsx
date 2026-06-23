import { useState, useEffect, useMemo } from 'react'
import LandingHero from '../components/LandingHero'
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
import { calcularPrecificacao, getFeesParaProduto } from '../utils/pricingLogic'
import { getCondicoes, saveProduto } from '../utils/storageUtils'

const DEFAULT_COSTS = {
  custoProduto: 35,
  custoEmbalagem: 3,
  freteAbsorvido: 8,
  outrosCustos: 0,
}

const DEFAULT_SLIDERS = {
  ads: 8,
  imposto: 6,
  devolucao: 1,
  margemAlvo: 15,
}

function readQueryParams() {
  const p = new URLSearchParams(window.location.search)
  const costs = {}
  const sliders = {}
  let marketplace = null

  if (p.get('mkt')) marketplace = p.get('mkt')
  if (p.get('custo')) costs.custoProduto = parseFloat(p.get('custo')) || DEFAULT_COSTS.custoProduto
  if (p.get('emb')) costs.custoEmbalagem = parseFloat(p.get('emb')) || DEFAULT_COSTS.custoEmbalagem
  if (p.get('frete')) costs.freteAbsorvido = parseFloat(p.get('frete')) || DEFAULT_COSTS.freteAbsorvido
  if (p.get('outros')) costs.outrosCustos = parseFloat(p.get('outros')) || DEFAULT_COSTS.outrosCustos
  if (p.get('ads')) sliders.ads = parseFloat(p.get('ads')) || DEFAULT_SLIDERS.ads
  if (p.get('imp')) sliders.imposto = parseFloat(p.get('imp')) || DEFAULT_SLIDERS.imposto
  if (p.get('dev')) sliders.devolucao = parseFloat(p.get('dev')) || DEFAULT_SLIDERS.devolucao
  if (p.get('margem')) sliders.margemAlvo = parseFloat(p.get('margem')) || DEFAULT_SLIDERS.margemAlvo

  return { costs, sliders, marketplace }
}

export default function Landing() {
  const query = useMemo(readQueryParams, [])

  const [marketplace, setMarketplace] = useState(query.marketplace || 'mercadolivre')
  const [categoria, setCategoria] = useState(null)
  const [costs, setCosts] = useState({ ...DEFAULT_COSTS, ...query.costs })
  const [sliders, setSliders] = useState({ ...DEFAULT_SLIDERS, ...query.sliders })
  const [unidades, setUnidades] = useState(50)
  const [nomeProduto, setNomeProduto] = useState('')
  const [modalSalvar, setModalSalvar] = useState(false)
  const [nomeSalvar, setNomeSalvar] = useState('')
  const [savedFeedback, setSavedFeedback] = useState(false)

  const resultados = useMemo(() => {
    return calcularPrecificacao({ ...costs, marketplace, categoria, ...sliders })
  }, [costs, marketplace, categoria, sliders])

  const melhorDado = useMemo(() => {
    const cl = resultados?.classico
    const pr = resultados?.premium
    if (cl && !cl.error && cl.melhorOpcao) return cl
    if (pr && !pr.error && pr.melhorOpcao) return pr
    if (cl && !cl.error) return cl
    if (pr && !pr.error) return pr
    return null
  }, [resultados])

  const fees = useMemo(() => getFeesParaProduto(marketplace, categoria, getCondicoes()), [marketplace, categoria])
  const totalPctSemMargem =
    fees.classico + sliders.ads / 100 + sliders.imposto / 100 + sliders.devolucao / 100

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <LandingHero />

      {/* Calculadora */}
      <section id="calculadora" className="py-12 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Calculadora de Precificação</h2>
          <p className="text-gray-500 text-sm">Preencha os campos e veja o resultado em tempo real</p>
        </div>

        <div className="space-y-8">
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

          {/* Passo 2B — Simulador de Frete */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">2B</span>
              <span className="text-sm font-medium text-gray-600">Simulador de Frete</span>
            </div>
            <SimuladorFrete
              marketplace={marketplace}
              precoIdealClassico={resultados?.classico?.precoIdeal ?? null}
              precoIdealPremium={resultados?.premium?.precoIdeal ?? null}
              onAplicarFrete={(valor) => setCosts(c => ({ ...c, freteAbsorvido: valor }))}
            />
          </div>

          {/* Passo 3 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <VariableSliders values={sliders} onChange={setSliders} />
          </div>

          {/* Passo 4 */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <ResultCards resultados={resultados} marketplace={marketplace} />
          </div>

          {/* Passo 4B — Comparativo entre Marketplaces */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <ComparativoMarketplaces
              costs={costs}
              sliders={sliders}
              condicoes={getCondicoes()}
              categoria={categoria}
            />
          </div>

          {/* Passo 5 — Diagnóstico */}
          {melhorDado && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">5</span>
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
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold mr-2">8</span>
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
              />
              <div className="mt-3">
                <button
                  onClick={() => { setNomeSalvar(nomeProduto); setModalSalvar(true) }}
                  className="flex items-center gap-2 bg-white border border-green-500 text-green-700 hover:bg-green-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  💾 Salvar produto no catálogo
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
                      saveProduto({ nome: nomeSalvar.trim() || 'Produto sem nome', marketplace, categoria, costs, sliders })
                      setModalSalvar(false)
                      setSavedFeedback(true)
                      setTimeout(() => setSavedFeedback(false), 3000)
                    }
                    if (e.key === 'Escape') setModalSalvar(false)
                  }}
                  placeholder="Ex: Camiseta P azul — fornecedor X"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveProduto({ nome: nomeSalvar.trim() || 'Produto sem nome', marketplace, categoria, costs, sliders })
                      setModalSalvar(false)
                      setSavedFeedback(true)
                      setTimeout(() => setSavedFeedback(false), 3000)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
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
              ✅ Produto salvo no catálogo!
              <a href="/catalogo" className="underline ml-1 hover:text-green-200">Ver catálogo →</a>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />

      {/* CTA Final */}
      <section className="bg-green-500 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gostou? Compartilhe com quem vende online.</h2>
        <p className="text-green-100 mb-6 text-sm">Ajude outros sellers a precificarem com inteligência.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin)
            }}
            className="bg-white text-green-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-green-50 transition-colors cursor-pointer"
          >
            🔗 Copiar link
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent('Calculei o preço ideal do meu produto com o MargemCerta. É gratuito e muito fácil de usar! ' + window.location.origin)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            💬 Compartilhar no WhatsApp
          </a>
        </div>
        <p className="text-green-200 text-xs mt-6">Em breve: salvar produtos, histórico e painel do seller.</p>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="text-white font-semibold">MargemCerta</span>
        </div>
        <p className="text-sm mb-1">Precifique certo. Lucre de verdade.</p>
        <p className="text-xs">Feito para sellers brasileiros 🇧🇷</p>
        <a href="mailto:ba_mms@hotmail.com" className="text-xs text-green-400 hover:text-green-300 mt-2 block">
          Enviar feedback
        </a>
      </footer>
    </div>
  )
}
