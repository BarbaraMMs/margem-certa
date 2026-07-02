export const REGIMES = { MEI: 'mei', SIMPLES: 'simples', PRESUMIDO: 'presumido', REAL: 'real' }

// Valores aproximados para cálculo de imposto sobre faturamento
export const ALIQUOTAS_PADRAO = { mei: 0.05, simples: 0.075, presumido: 0.114, real: 0.15 }

const DESCRICOES_REGIME = {
  mei: 'MEI (DAS fixo)',
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
}

export function getAliquotaImposto(regime) {
  return ALIQUOTAS_PADRAO[regime] ?? ALIQUOTAS_PADRAO[REGIMES.SIMPLES]
}

export function getDescricaoRegime(regime) {
  return DESCRICOES_REGIME[regime] ?? DESCRICOES_REGIME[REGIMES.SIMPLES]
}
