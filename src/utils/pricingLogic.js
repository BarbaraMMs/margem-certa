import { getCondicoes } from './storageUtils'

export const FEES = {
  mercadolivre: { classico: 0.13, premium: 0.19 },
  shopee:       { classico: 0.14, premium: 0.14 },
  amazon:       { classico: 0.13, premium: 0.15 },
  magalu:       { classico: 0.13, premium: 0.16 },
  americanas:   { classico: 0.14, premium: 0.17 },
}

export function getFeesParaProduto(marketplace, categoria, condicoes, customFees) {
  const c = condicoes || getCondicoes()
  const defaultFees = (() => {
    if (c && c.length) {
      const match = c.find(r => r.marketplace === marketplace && r.categoria === categoria)
      if (match) return { classico: match.classico, premium: match.premium }
      const fallback = c.find(r => r.marketplace === marketplace && !r.categoria)
      if (fallback) return { classico: fallback.classico, premium: fallback.premium }
    }
    return FEES[marketplace] || FEES.mercadolivre
  })()

  if (customFees && typeof customFees === 'object') {
    return {
      classico: Number.isFinite(customFees.classico) ? Number(customFees.classico) : defaultFees.classico,
      premium: Number.isFinite(customFees.premium) ? Number(customFees.premium) : defaultFees.premium,
    }
  }

  return defaultFees
}

export const MARKETPLACE_LABELS = {
  mercadolivre: 'Mercado Livre',
  shopee:       'Shopee',
  amazon:       'Amazon',
  magalu:       'Magalu',
  americanas:   'Americanas',
}

const ML_FRETE_FIXO = 6.00
const ML_LIMIAR    = 79.00

// ── Shopee Brasil 2026 — comissão + taxa fixa por faixa de preço ───────────
// A Shopee não diferencia taxa por categoria de produto: a variação é
// exclusivamente por faixa de preço do item.
export const SHOPEE_TIERS = [
  { min: 0,   max: 79.99,      comissao: 0.20, taxaFixa: 4.00,  freteCoParticipacao: 5.00,  label: 'Até R$79,99' },
  { min: 80,  max: 99.99,      comissao: 0.14, taxaFixa: 16.00, freteCoParticipacao: 7.50,  label: 'R$80,00 a R$99,99' },
  { min: 100, max: 199.99,     comissao: 0.14, taxaFixa: 20.00, freteCoParticipacao: 7.50,  label: 'R$100,00 a R$199,99' },
  { min: 200, max: 499.99,     comissao: 0.14, taxaFixa: 26.00, freteCoParticipacao: 10.00, label: 'R$200,00 a R$499,99' },
  { min: 500, max: Infinity,   comissao: 0.14, taxaFixa: 28.00, freteCoParticipacao: 10.00, label: 'Acima de R$500,00' },
]

// Taxa de processamento de pagamento — incide em toda venda.
export const SHOPEE_TAXA_TRANSACAO_PCT = 0.02
// Opcional: só incide quando o seller participa de campanhas de destaque (11.11, etc.)
export const SHOPEE_TAXA_CAMPANHA_PCT = 0.025

/**
 * Resolve a faixa de preço da Shopee aplicável, dado o custo fixo (produto + embalagem
 * + frete absorvido + outros) e os percentuais que não dependem da faixa (ads, imposto,
 * devolução, margem). Como a taxa fixa e a co-participação de frete variam por faixa —
 * e a faixa depende do preço final —, testamos as faixas em ordem crescente e aceitamos
 * a primeira cujo preço resultante realmente cai dentro do próprio intervalo.
 */
function resolveShopeeTier({ custoFixoTotalBase, pctSemFee, comissaoOverride, campanhaShopee }) {
  const extraPct = SHOPEE_TAXA_TRANSACAO_PCT + (campanhaShopee ? SHOPEE_TAXA_CAMPANHA_PCT : 0)
  let ultimo = null

  for (const tier of SHOPEE_TIERS) {
    const comissao = Number.isFinite(comissaoOverride) ? comissaoOverride : tier.comissao
    const totalPct = comissao + extraPct + pctSemFee
    if (totalPct >= 1) { ultimo = { tier, comissao, totalPct, error: 'overflow' }; continue }

    const custoAjustado = custoFixoTotalBase + tier.taxaFixa + tier.freteCoParticipacao
    const preco = custoAjustado / (1 - totalPct)
    ultimo = { tier, comissao, totalPct, custoAjustado, preco }

    if (preco >= tier.min && preco <= tier.max) return ultimo
  }

  // Nenhuma faixa "fechou" exatamente (caso extremo) — usa a última tentativa como aproximação.
  return ultimo
}

function calcPrecoIdeal({ custoFixoTotal, fee, ads, imposto, devolucao, margemAlvo, isMercadoLivre }) {
  const totalPct = fee + ads / 100 + imposto / 100 + devolucao / 100 + margemAlvo / 100

  if (totalPct >= 1) return { error: 'overflow' }

  const custoAjustado = isMercadoLivre
    ? calcComFreteML(custoFixoTotal, totalPct)
    : custoFixoTotal

  const preco = custoAjustado / (1 - totalPct)
  return { preco, custoAjustado }
}

function calcComFreteML(custoBase, totalPct) {
  const precoSemFrete = custoBase / (1 - totalPct)
  if (precoSemFrete >= ML_LIMIAR) return custoBase
  return custoBase + ML_FRETE_FIXO
}

export function calcularPrecificacao({
  custoProduto,
  custoEmbalagem,
  freteAbsorvido,
  outrosCustos,
  marketplace,
  categoria,
  ads,
  imposto,
  devolucao,
  margemAlvo,
  condicoes,
  customFees,
  campanhaShopee,
}) {
  const custoFixoTotalBase =
    (Number(custoProduto) || 0) +
    (Number(custoEmbalagem) || 0) +
    (Number(freteAbsorvido) || 0) +
    (Number(outrosCustos) || 0)

  const isMercadoLivre = marketplace === 'mercadolivre'
  const isShopee = marketplace === 'shopee'
  const fees = isShopee ? null : getFeesParaProduto(marketplace, categoria || null, condicoes, customFees)

  const pctSemFee = ads / 100 + imposto / 100 + devolucao / 100 + margemAlvo / 100

  const resultados = {}

  for (const tipo of ['classico', 'premium']) {
    let preco, custoAjustado, fee, shopeeTier

    if (isShopee) {
      const comissaoOverride = customFees && Number.isFinite(customFees[tipo]) ? customFees[tipo] : null
      const resolved = resolveShopeeTier({ custoFixoTotalBase, pctSemFee, comissaoOverride, campanhaShopee })
      if (!resolved || resolved.error || resolved.totalPct >= 1) {
        resultados[tipo] = { error: 'A soma dos percentuais ultrapassa 100%. Revise os valores.' }
        continue
      }
      preco = resolved.preco
      custoAjustado = resolved.custoAjustado
      fee = resolved.comissao
      shopeeTier = resolved.tier
    } else {
      fee = fees[tipo]
      const totalPct = fee + pctSemFee
      if (totalPct >= 1) {
        resultados[tipo] = { error: 'A soma dos percentuais ultrapassa 100%. Revise os valores.' }
        continue
      }
      const calc = calcPrecoIdeal({ custoFixoTotal: custoFixoTotalBase, fee, ads, imposto, devolucao, margemAlvo, isMercadoLivre })
      if (calc.error) {
        resultados[tipo] = { error: 'A soma dos percentuais ultrapassa 100%. Revise os valores.' }
        continue
      }
      preco = calc.preco
      custoAjustado = calc.custoAjustado
    }

    if (preco <= 0 || !isFinite(preco)) {
      resultados[tipo] = { error: 'Preço inválido. Verifique os custos informados.' }
      continue
    }

    const feeEmReais = fee * preco
    const adsEmReais = (ads / 100) * preco
    const impostoEmReais = (imposto / 100) * preco
    const devolucaoEmReais = (devolucao / 100) * preco
    const margemEmReais = (margemAlvo / 100) * preco
    const taxaTransacaoEmReais = isShopee ? SHOPEE_TAXA_TRANSACAO_PCT * preco : 0
    const taxaCampanhaEmReais = isShopee && campanhaShopee ? SHOPEE_TAXA_CAMPANHA_PCT * preco : 0

    const totalDescontos = feeEmReais + taxaTransacaoEmReais + taxaCampanhaEmReais + adsEmReais + impostoEmReais + devolucaoEmReais
    const lucroPorUnidade = preco - custoAjustado - totalDescontos
    const margemReal = lucroPorUnidade / preco
    const markupAquisicao = custoProduto > 0 ? (preco - custoProduto) / custoProduto : 0
    const markupTotal = custoFixoTotalBase > 0 ? (preco - custoFixoTotalBase) / custoFixoTotalBase : 0
    const custoR6Aplicado = isMercadoLivre && custoAjustado > custoFixoTotalBase

    const itens = [
      { label: 'Comissão marketplace', valor: feeEmReais, pct: fee },
    ]
    if (isShopee) {
      itens.push({ label: 'Taxa fixa por item', valor: shopeeTier.taxaFixa, pct: null })
      itens.push({ label: 'Taxa de transação (pagamento)', valor: taxaTransacaoEmReais, pct: SHOPEE_TAXA_TRANSACAO_PCT })
      itens.push({ label: 'Co-participação frete grátis', valor: shopeeTier.freteCoParticipacao, pct: null })
      if (campanhaShopee) itens.push({ label: 'Taxa de campanha (opcional)', valor: taxaCampanhaEmReais, pct: SHOPEE_TAXA_CAMPANHA_PCT })
    }
    if (custoR6Aplicado) {
      itens.push({ label: 'Frete fixo obrigatório (< R$79)', valor: ML_FRETE_FIXO, pct: null })
    }
    itens.push({ label: 'Investimento em anúncios (Ads)', valor: adsEmReais, pct: ads / 100 })
    itens.push({ label: 'Imposto estimado', valor: impostoEmReais, pct: imposto / 100 })
    itens.push({ label: 'Devolução / quebra', valor: devolucaoEmReais, pct: devolucao / 100 })
    itens.push({ label: 'Margem líquida desejada', valor: margemEmReais, pct: margemAlvo / 100 })

    resultados[tipo] = {
      precoIdeal: preco,
      feeEmReais,
      lucroPorUnidade,
      margemReal,
      markup: markupTotal,
      markupAquisicao,
      markupTotal,
      custoFixoTotal: custoAjustado,
      custoFixoTotalBase,
      custoR6Aplicado,
      faixaPrecoShopee: shopeeTier?.label ?? null,
      detalheTaxas: {
        taxaMarketplace: fee,
        taxaAds: ads / 100,
        taxaImposto: imposto / 100,
        taxaDevolucao: devolucao / 100,
        margemDesejada: margemAlvo / 100,
        taxaTransacao: isShopee ? SHOPEE_TAXA_TRANSACAO_PCT : 0,
        taxaCampanha: isShopee && campanhaShopee ? SHOPEE_TAXA_CAMPANHA_PCT : 0,
        taxaFixaReais: isShopee ? shopeeTier.taxaFixa : (custoR6Aplicado ? ML_FRETE_FIXO : 0),
        freteCoParticipacaoReais: isShopee ? shopeeTier.freteCoParticipacao : 0,
        itens,
      },
    }
  }

  // Badge "melhor opção"
  const cl = resultados.classico
  const pr = resultados.premium
  if (cl && pr && !cl.error && !pr.error) {
    if (cl.margemReal >= pr.margemReal) {
      cl.melhorOpcao = true
    } else {
      pr.melhorOpcao = true
    }
  }

  return resultados
}

/** Recebe um produto salvo no catálogo ({ costs, sliders, marketplace, categoria, customFees })
 *  e retorna o resultado (clássico ou premium) com a melhor margem real. */
export function calcularMelhorOferta(produto) {
  const res = calcularPrecificacao({
    ...produto.costs,
    marketplace: produto.marketplace,
    categoria: produto.categoria || null,
    ...produto.sliders,
    customFees: produto.customFees,
    campanhaShopee: produto.campanhaShopee || false,
  })
  const cl = res?.classico
  const pr = res?.premium
  if (cl && pr && !cl.error && !pr.error) return cl.margemReal >= pr.margemReal ? cl : pr
  if (cl && !cl.error) return cl
  if (pr && !pr.error) return pr
  return null
}

export function calcularProjecao({ lucroPorUnidade, unidades }) {
  const lucroMensal = lucroPorUnidade * unidades
  const lucroAnual = lucroMensal * 12
  return { lucroMensal, lucroAnual }
}

export function calcularSimulacao({ precoSimulado, precoIdeal, lucroPorUnidade, custoFixoTotal, totalPct, unidades }) {
  if (!precoSimulado || precoSimulado <= 0) return null

  const lucroReal = precoSimulado * (1 - totalPct) - custoFixoTotal
  const margemReal = lucroReal / precoSimulado
  const diferenca = precoSimulado - precoIdeal
  const lucroMensal = lucroReal * unidades

  return { lucroReal, margemReal, diferenca, lucroMensal }
}

export function getDiagnostico(margemReal, margemAlvo) {
  const pct = margemReal * 100
  const alvo = margemAlvo

  if (pct < 5) {
    return {
      nivel: 'critico',
      cor: 'red',
      titulo: 'Margem crítica!',
      mensagem: 'Você está vendendo no prejuízo ou quase. Aumente o preço ou reduza o custo do produto.',
      acao: 'Renegocie o preço com o fornecedor ou ajuste o custo de embalagem/frete.',
    }
  }
  if (pct < alvo) {
    return {
      nivel: 'atencao',
      cor: 'orange',
      titulo: 'Margem abaixo da meta.',
      mensagem: `Sua margem atual (${pct.toFixed(1)}%) está abaixo da meta de ${alvo}%.`,
      acao: 'Considere reduzir os Ads, negociar frete ou aumentar o preço de venda.',
    }
  }
  return {
    nivel: 'saudavel',
    cor: 'green',
    titulo: 'Margem saudável!',
    mensagem: `Seu produto está bem precificado com ${pct.toFixed(1)}% de margem líquida.`,
    acao: 'Continue monitorando custos. Considere investir mais em Ads para escalar vendas.',
  }
}

export function formatBRL(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPct(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}
