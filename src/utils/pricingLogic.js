import { getCondicoes } from './storageUtils'

export const FEES = {
  mercadolivre: { classico: 0.13, premium: 0.18 },
  shopee:       { classico: 0.12, premium: 0.12 },
  amazon:       { classico: 0.13, premium: 0.15 },
  magalu:       { classico: 0.13, premium: 0.16 },
  americanas:   { classico: 0.14, premium: 0.17 },
}

export function getFeesParaProduto(marketplace, categoria, condicoes) {
  const c = condicoes || getCondicoes()
  if (c && c.length) {
    const match = c.find(r => r.marketplace === marketplace && r.categoria === categoria)
    if (match) return { classico: match.classico, premium: match.premium }
    const fallback = c.find(r => r.marketplace === marketplace && !r.categoria)
    if (fallback) return { classico: fallback.classico, premium: fallback.premium }
  }
  return FEES[marketplace] || FEES.mercadolivre
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
}) {
  const custoFixoTotal =
    (Number(custoProduto) || 0) +
    (Number(custoEmbalagem) || 0) +
    (Number(freteAbsorvido) || 0) +
    (Number(outrosCustos) || 0)

  const fees = getFeesParaProduto(marketplace, categoria || null, condicoes)
  const isMercadoLivre = marketplace === 'mercadolivre'

  const pctSemFee = ads / 100 + imposto / 100 + devolucao / 100 + margemAlvo / 100

  const resultados = {}

  for (const tipo of ['classico', 'premium']) {
    const fee = fees[tipo]
    const totalPct = fee + pctSemFee

    if (totalPct >= 1) {
      resultados[tipo] = { error: 'A soma dos percentuais ultrapassa 100%. Revise os valores.' }
      continue
    }

    const { preco, custoAjustado, error } = calcPrecoIdeal({
      custoFixoTotal,
      fee,
      ads,
      imposto,
      devolucao,
      margemAlvo,
      isMercadoLivre,
    })

    if (error) {
      resultados[tipo] = { error: 'A soma dos percentuais ultrapassa 100%. Revise os valores.' }
      continue
    }

    if (preco <= 0 || !isFinite(preco)) {
      resultados[tipo] = { error: 'Preço inválido. Verifique os custos informados.' }
      continue
    }

    const feeEmReais = fee * preco
    const totalDescontos = (fee + ads / 100 + imposto / 100 + devolucao / 100) * preco
    const lucroPorUnidade = preco - custoAjustado - totalDescontos
    const margemReal = lucroPorUnidade / preco
    const markup = custoProduto > 0 ? (preco - custoProduto) / custoProduto : 0

    resultados[tipo] = {
      precoIdeal: preco,
      feeEmReais,
      lucroPorUnidade,
      margemReal,
      markup,
      custoFixoTotal: custoAjustado,
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
