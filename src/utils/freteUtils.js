// ── Tabela ML Flex (estimativa por faixa de peso) ──────────────────────────
// Referência: valores praticados via transportadoras parceiras ML, 2025
export const ML_FLEX_TABLE = [
  { pesoMax: 0.3,  custo: 6.50  },
  { pesoMax: 0.5,  custo: 7.50  },
  { pesoMax: 1.0,  custo: 9.00  },
  { pesoMax: 2.0,  custo: 11.00 },
  { pesoMax: 5.0,  custo: 15.00 },
  { pesoMax: 10.0, custo: 22.00 },
  { pesoMax: 30.0, custo: 35.00 },
]

// ── Tabela Correios PAC via ML (tarifas subsidiadas) ──────────────────────
export const CORREIOS_PAC_TABLE = [
  { pesoMax: 0.3,  custo: 8.00  },
  { pesoMax: 0.5,  custo: 9.50  },
  { pesoMax: 1.0,  custo: 12.00 },
  { pesoMax: 2.0,  custo: 15.00 },
  { pesoMax: 5.0,  custo: 20.00 },
  { pesoMax: 10.0, custo: 28.00 },
  { pesoMax: 30.0, custo: 45.00 },
]

// ── Tabela Correios SEDEX via ML ───────────────────────────────────────────
export const CORREIOS_SEDEX_TABLE = [
  { pesoMax: 0.3,  custo: 15.00 },
  { pesoMax: 0.5,  custo: 18.00 },
  { pesoMax: 1.0,  custo: 22.00 },
  { pesoMax: 2.0,  custo: 28.00 },
  { pesoMax: 5.0,  custo: 38.00 },
  { pesoMax: 10.0, custo: 55.00 },
  { pesoMax: 30.0, custo: 85.00 },
]

// ── Tabela ML Full (por categoria de tamanho) ─────────────────────────────
// ML Full não usa peso linear — usa categoria de tamanho da embalagem
export const ML_FULL_CATEGORIAS = [
  {
    id: 'pequeno',
    nome: 'Pequeno',
    descricao: 'Até 300g | Embalagem até 20×15×5 cm',
    pesoMax: 0.3,
    dimMax: { c: 20, l: 15, a: 5 },
    custo: 7.00,
  },
  {
    id: 'medio',
    nome: 'Médio',
    descricao: 'Até 2 kg | Embalagem até 40×30×20 cm',
    pesoMax: 2.0,
    dimMax: { c: 40, l: 30, a: 20 },
    custo: 10.50,
  },
  {
    id: 'grande',
    nome: 'Grande',
    descricao: 'Até 5 kg | Embalagem até 60×45×30 cm',
    pesoMax: 5.0,
    dimMax: { c: 60, l: 45, a: 30 },
    custo: 16.00,
  },
  {
    id: 'extra_grande',
    nome: 'Extra Grande',
    descricao: 'Até 30 kg | Acima de 60×45×30 cm',
    pesoMax: 30.0,
    dimMax: null,
    custo: 28.00,
  },
]

export function calcPesoCubado(c, l, a) {
  if (!c || !l || !a) return 0
  return (c * l * a) / 6000
}

export function calcPesoTarifavel(pesoReal, c, l, a) {
  const cubado = calcPesoCubado(c, l, a)
  return cubado > 0 ? Math.max(pesoReal, cubado) : pesoReal
}

export function getCategoriaMlFull(pesoReal, c, l, a) {
  if (c && l && a) {
    return ML_FULL_CATEGORIAS.find(cat =>
      cat.dimMax &&
      c <= cat.dimMax.c &&
      l <= cat.dimMax.l &&
      a <= cat.dimMax.a &&
      pesoReal <= cat.pesoMax
    ) || ML_FULL_CATEGORIAS[ML_FULL_CATEGORIAS.length - 1]
  }
  return ML_FULL_CATEGORIAS.find(cat => pesoReal <= cat.pesoMax) ||
         ML_FULL_CATEGORIAS[ML_FULL_CATEGORIAS.length - 1]
}

function buscaTabela(tabela, peso) {
  return (tabela.find(f => peso <= f.pesoMax) || tabela[tabela.length - 1]).custo
}

export function calcularEstimativaFrete({ peso, comprimento, largura, altura, modalidade }) {
  const pesoReal = Number(peso) || 0
  const c = Number(comprimento) || 0
  const l = Number(largura) || 0
  const a = Number(altura) || 0
  if (pesoReal <= 0) return null

  const pesoCubado = calcPesoCubado(c, l, a)
  const pesoTarifavel = pesoCubado > 0 ? Math.max(pesoReal, pesoCubado) : pesoReal
  const usouCubado = pesoCubado > pesoReal

  switch (modalidade) {
    case 'ml_flex':
      return {
        custo: buscaTabela(ML_FLEX_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa para ML Flex. O valor varia por rota e transportadora parceira.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'correios_pac':
      return {
        custo: buscaTabela(CORREIOS_PAC_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa PAC via ML (tarifas subsidiadas). Confirme os valores na sua conta ML.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'correios_sedex':
      return {
        custo: buscaTabela(CORREIOS_SEDEX_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa SEDEX via ML. O valor varia por origem e destino.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'ml_full': {
      const cat = getCategoriaMlFull(pesoReal, c, l, a)
      return {
        custo: cat.custo,
        pesoReal, pesoCubado: 0, pesoTarifavel: pesoReal, usouCubado: false,
        categoriaFull: cat,
        aviso: `Produto na categoria "${cat.nome}" do ML Full. Custo por unidade enviada. Não inclui mensalidade de armazenagem.`,
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/sobre-mercado-envios-full_1505',
      }
    }
    default:
      return null
  }
}

export const ML_LIMIAR_FRETE_GRATIS = 79.00

export function getStatusAbsorcaoFrete({ marketplace, tipoListagem, precoIdeal }) {
  if (marketplace !== 'mercadolivre') {
    return {
      tipo: 'info',
      mensagem: 'Verifique a política de frete deste marketplace.',
    }
  }
  if (tipoListagem === 'ml_full') {
    return {
      tipo: 'obrigatorio',
      mensagem: 'No ML Full o custo de fulfillment é sempre absorvido por você por unidade enviada.',
    }
  }
  if (tipoListagem === 'premium' && precoIdeal >= ML_LIMIAR_FRETE_GRATIS) {
    return {
      tipo: 'obrigatorio',
      mensagem: `Seu preço (R$${precoIdeal?.toFixed(2)}) está acima de R$79. No Anúncio Premium o frete grátis é obrigatório — você absorve este custo no preço de venda.`,
    }
  }
  if (tipoListagem === 'premium' && precoIdeal < ML_LIMIAR_FRETE_GRATIS) {
    return {
      tipo: 'atencao',
      mensagem: `Seu preço está abaixo de R$79. O frete grátis é opcional no Premium neste caso, mas oferecê-lo pode aumentar suas conversões.`,
    }
  }
  if (tipoListagem === 'classico') {
    return {
      tipo: 'opcional',
      mensagem: 'No Anúncio Clássico você decide se absorve o frete ou repassa ao comprador.',
    }
  }
  return null
}
