import { useState, useMemo } from 'react'
import { Package, Info, AlertOctagon, AlertTriangle, Circle, Check } from 'lucide-react'
import {
  calcularEstimativaFrete,
  calcPesoCubado,
  getStatusAbsorcaoFrete,
} from '../utils/freteUtils'
import { formatBRL } from '../utils/pricingLogic'

const MODALIDADES = [
  {
    id: 'ml_flex',
    label: 'ML Flex',
    descricao: 'Entrega feita por você ou motoboy parceiro. Ideal para SP capital.',
    instrucao: 'Ideal para quem entrega com motoboy ou carro próprio. Disponível principalmente em grandes centros. O custo varia pela rota — este é um valor de referência.',
  },
  {
    id: 'correios_pac',
    label: 'Correios PAC',
    descricao: 'Entrega padrão pelos Correios. Prazo 5–10 dias úteis.',
    instrucao: 'A modalidade mais comum para envios nacionais. O ML negocia tarifas menores que o balcão dos Correios. Confirme o valor exato no painel do ML.',
  },
  {
    id: 'correios_sedex',
    label: 'Correios SEDEX',
    descricao: 'Entrega expressa pelos Correios. Prazo 1–3 dias úteis.',
    instrucao: 'Entrega expressa, mais cara. Use quando a velocidade de entrega for um diferencial do seu produto.',
  },
  {
    id: 'ml_full',
    label: 'ML Full',
    descricao: 'Armazenamento no galpão do ML. Custo por unidade enviada.',
    instrucao: 'Você envia seus produtos em lote para o galpão do ML. Eles empacotam e entregam para o cliente. O custo é por unidade enviada ao cliente final, mais uma mensalidade de armazenagem (não incluída aqui).',
  },
  {
    id: 'manual',
    label: 'Informar manualmente',
    descricao: 'Você já sabe o custo. Digite diretamente.',
    instrucao: 'Se você já tem o valor exato do frete (da sua conta ML, transportadora ou cotação), use este campo.',
  },
]

const ABSORPCAO_STYLES = {
  obrigatorio: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: AlertOctagon,
  },
  atencao: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: AlertTriangle,
  },
  opcional: {
    bg: 'bg-brass-100/40',
    border: 'border-brass-200',
    text: 'text-brass-700',
    icon: Circle,
  },
  info: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    icon: Info,
  },
}

export default function SimuladorFrete({
  marketplace,
  precoIdealClassico,
  precoIdealPremium,
  onAplicarFrete,
}) {
  const [modalidade, setModalidade] = useState('ml_flex')
  const [peso, setPeso] = useState('')
  const [comprimento, setComprimento] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [expandirDimensoes, setExpandirDimensoes] = useState(false)
  const [freteManual, setFreteManual] = useState('')
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false)

  const modalidadeAtual = MODALIDADES.find(m => m.id === modalidade)
  const isModoManual = modalidade === 'manual'

  const pesoCubado = useMemo(() => {
    if (!comprimento || !largura || !altura) return 0
    return calcPesoCubado(Number(comprimento), Number(largura), Number(altura))
  }, [comprimento, largura, altura])

  const estimativa = useMemo(() => {
    if (isModoManual) return null
    return calcularEstimativaFrete({
      peso,
      comprimento: expandirDimensoes ? comprimento : '',
      largura: expandirDimensoes ? largura : '',
      altura: expandirDimensoes ? altura : '',
      modalidade,
    })
  }, [peso, comprimento, largura, altura, modalidade, expandirDimensoes, isModoManual])

  const custoFinal = isModoManual ? (Number(freteManual) || 0) : estimativa?.custo

  const statusClassico = useMemo(() => {
    if (!precoIdealClassico) return null
    return getStatusAbsorcaoFrete({
      marketplace,
      tipoListagem: 'classico',
      precoIdeal: precoIdealClassico,
    })
  }, [marketplace, precoIdealClassico])

  const statusPremium = useMemo(() => {
    if (!precoIdealPremium) return null
    return getStatusAbsorcaoFrete({
      marketplace,
      tipoListagem: modalidade === 'ml_full' ? 'ml_full' : 'premium',
      precoIdeal: precoIdealPremium,
    })
  }, [marketplace, precoIdealPremium, modalidade])

  function handleAplicar() {
    if (custoFinal != null && custoFinal >= 0) {
      onAplicarFrete(custoFinal)
    }
  }

  const podeAplicar = custoFinal != null && custoFinal > 0

  return (
    <div className="space-y-5">
      {/* Cabeçalho — BLOCO A */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5 text-ink-900" strokeWidth={2} />
          <h3 className="text-base font-semibold text-gray-800">Simulador de Frete</h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Use este simulador para estimar quanto você pagará de frete por produto vendido e incluir esse valor corretamente no seu preço de venda.
        </p>
        <button
          type="button"
          onClick={() => setMostrarExplicacao(v => !v)}
          className="text-xs text-brass-700 hover:text-brass-800 underline underline-offset-2 flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" strokeWidth={2} /> {mostrarExplicacao ? 'Ocultar explicação' : 'O que é peso cubado?'}
        </button>
        {mostrarExplicacao && (
          <div className="mt-2 p-3 bg-brass-100/40 border border-brass-100 rounded-xl text-xs text-brass-800 leading-relaxed">
            <p>Transportadoras cobram pelo maior valor entre o peso real e o peso volumétrico (cubado). Um produto leve mas volumoso pode ser cobrado como se pesasse muito mais.</p>
            <p className="mt-1"><strong>Fórmula:</strong> Comprimento × Largura × Altura ÷ 6.000</p>
            <p className="mt-1"><strong>Exemplo:</strong> Caixa de 40×30×20 cm = 4 kg de peso cubado, independente do peso real.</p>
          </div>
        )}
      </div>

      {/* Formulário — BLOCO B */}
      <div className="space-y-4">
        {/* Modalidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modalidade de envio <span className="text-red-500">*</span>
          </label>
          <select
            value={modalidade}
            onChange={e => setModalidade(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
          >
            {MODALIDADES.map(m => (
              <option key={m.id} value={m.id}>{m.label} — {m.descricao}</option>
            ))}
          </select>
          {modalidadeAtual?.instrucao && (
            <p className="text-xs text-gray-500 mt-1">{modalidadeAtual.instrucao}</p>
          )}
        </div>

        {/* Campo manual */}
        {isModoManual ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custo do frete que você paga (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={freteManual}
              onChange={e => setFreteManual(e.target.value)}
              placeholder="ex: 12,50"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
            <p className="text-xs text-gray-500 mt-1">Se você já tem o valor exato do frete, use este campo.</p>
          </div>
        ) : (
          <>
            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso da embalagem (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={peso}
                onChange={e => setPeso(e.target.value)}
                placeholder="ex: 0,500"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
              />
              <p className="text-xs text-gray-500 mt-1">Peso do produto com embalagem</p>
            </div>

            {/* Expansão dimensões */}
            {modalidade !== 'ml_full' && (
              <button
                type="button"
                onClick={() => setExpandirDimensoes(v => !v)}
                className="text-xs text-brass-600 hover:text-brass-700 underline underline-offset-2 flex items-center gap-1"
              >
                {expandirDimensoes ? '▾' : '▸'} {expandirDimensoes ? 'Ocultar dimensões' : 'Incluir dimensões para calcular peso cubado (recomendado)'}
              </button>
            )}

            {expandirDimensoes && modalidade !== 'ml_full' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Comprimento (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={comprimento}
                      onChange={e => setComprimento(e.target.value)}
                      placeholder="ex: 30"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Largura (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={largura}
                      onChange={e => setLargura(e.target.value)}
                      placeholder="ex: 20"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={altura}
                      onChange={e => setAltura(e.target.value)}
                      placeholder="ex: 10"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass-400"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Dica: Meça a embalagem fechada, não o produto solto.</p>

                {/* Mini resumo de pesos em tempo real */}
                {peso && comprimento && largura && altura && (
                  <div className="text-xs space-y-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Peso real:</span>
                      <span className="font-medium">{Number(peso).toFixed(3)} kg</span>
                    </div>
                    <div className={`flex justify-between ${pesoCubado > Number(peso) ? 'text-orange-600 font-semibold' : ''}`}>
                      <span>Peso cubado:</span>
                      <span>{pesoCubado.toFixed(3)} kg {pesoCubado > Number(peso) ? '⚠ maior que o peso real!' : ''}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-1 mt-1">
                      <span>Peso tarifável (cobrado):</span>
                      <span>{Math.max(Number(peso) || 0, pesoCubado).toFixed(3)} kg</span>
                    </div>
                    {pesoCubado > Number(peso) && (
                      <p className="text-orange-600 text-xs mt-1">
                        Sua embalagem ocupa mais espaço do que pesa. O frete será calculado pelo peso cubado.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resultado — BLOCO C */}
      {(estimativa || (isModoManual && Number(freteManual) > 0)) && (
        <div className="space-y-3">
          {/* Card estimativa */}
          {estimativa && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimativa de Frete</p>

              {estimativa.categoriaFull ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Categoria ML Full:</span>
                    <span className="font-medium">{estimativa.categoriaFull.nome}</span>
                  </div>
                  <p className="text-xs text-gray-400">{estimativa.categoriaFull.descricao}</p>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Peso real:</span>
                    <span>{estimativa.pesoReal.toFixed(3)} kg</span>
                  </div>
                  {estimativa.pesoCubado > 0 && (
                    <div className={`flex justify-between ${estimativa.usouCubado ? 'text-orange-600 font-semibold' : ''}`}>
                      <span>Peso cubado:</span>
                      <span>{estimativa.pesoCubado.toFixed(3)} kg {estimativa.usouCubado ? '⚠ maior que o peso real!' : ''}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-1">
                    <span>Peso tarifável (cobrado):</span>
                    <span>{estimativa.pesoTarifavel.toFixed(3)} kg</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Custo estimado:</span>
                <span className="text-lg font-bold text-ink-900">{formatBRL(estimativa.custo)}</span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>⚠ {estimativa.aviso}</p>
                <a
                  href={estimativa.linkOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass-700 hover:underline block"
                >
                  → Ver tabela oficial
                </a>
              </div>
            </div>
          )}

          {/* Alertas de absorção por listagem */}
          {(statusClassico || statusPremium) && marketplace === 'mercadolivre' && (
            <div className="space-y-2">
              {[
                { status: statusPremium, label: 'Anúncio Premium' },
                { status: statusClassico, label: 'Anúncio Clássico' },
              ].map(({ status, label }) => {
                if (!status) return null
                const s = ABSORPCAO_STYLES[status.tipo] || ABSORPCAO_STYLES.info
                return (
                  <div
                    key={label}
                    className={`${s.bg} border ${s.border} rounded-xl p-3`}
                  >
                    <p className="text-xs font-semibold text-gray-500 mb-1">{label} — Quem paga o frete?</p>
                    <p className={`flex items-start gap-1.5 text-sm ${s.text}`}>
                      <s.icon className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} /> {status.mensagem}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Botão aplicar */}
          <button
            type="button"
            onClick={handleAplicar}
            disabled={!podeAplicar}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              podeAplicar
                ? 'bg-ink-900 hover:bg-ink-800 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {podeAplicar
              ? <><Check className="w-4 h-4" strokeWidth={2} /> Usar {formatBRL(custoFinal)} como Frete Absorvido na calculadora</>
              : 'Preencha os campos para aplicar'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Ao clicar, o valor será preenchido automaticamente no campo "Frete Absorvido" da calculadora acima e o preço ideal será recalculado.
          </p>
        </div>
      )}

      {/* Rodapé sempre visível */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          ⚠️ Os valores são estimativas baseadas em tabelas de referência. As tarifas variam por rota, peso, dimensão e contratos específicos de cada seller com o ML. Consulte sempre o painel oficial antes de tomar decisões de precificação.
        </p>
        <a
          href="https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brass-700 hover:underline mt-1 block"
        >
          Ver tabela oficial do Mercado Livre →
        </a>
      </div>
    </div>
  )
}
