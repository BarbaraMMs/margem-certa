import * as XLSX from 'xlsx'
import { calcularMelhorOferta } from './pricingLogic'
import { getMarketplaceLabel } from './storageUtils'

function round2(value) {
  return value == null || isNaN(value) ? null : Number(value.toFixed(2))
}

export function exportarCatalogoXLSX(produtos) {
  const linhas = produtos.map(p => {
    const melhor = calcularMelhorOferta(p)
    const dt = melhor?.detalheTaxas

    return {
      'Produto': p.nome,
      'Marketplace': getMarketplaceLabel(p.marketplace),
      'Faixa de Preço Shopee': melhor?.faixaPrecoShopee ?? '—',
      'Preço Ideal (R$)': round2(melhor?.precoIdeal),
      'Margem Real (%)': melhor ? Number((melhor.margemReal * 100).toFixed(1)) : null,
      'Custo do Produto (R$)': p.costs?.custoProduto ?? null,
      'Comissão Marketplace (R$)': round2(melhor?.feeEmReais),
      'Taxa Fixa (R$)': round2(dt?.taxaFixaReais),
      'Co-participação Frete Grátis (R$)': round2(dt?.freteCoParticipacaoReais),
      'Taxa de Transação (R$)': melhor ? round2(dt.taxaTransacao * melhor.precoIdeal) : null,
      'Taxa de Campanha (R$)': melhor ? round2(dt.taxaCampanha * melhor.precoIdeal) : null,
      'Ads (R$)': melhor ? round2(dt.taxaAds * melhor.precoIdeal) : null,
      'Imposto (R$)': melhor ? round2(dt.taxaImposto * melhor.precoIdeal) : null,
      'Devolução (R$)': melhor ? round2(dt.taxaDevolucao * melhor.precoIdeal) : null,
      'Margem Desejada (R$)': melhor ? round2(dt.margemDesejada * melhor.precoIdeal) : null,
      'Lucro por Unidade (R$)': round2(melhor?.lucroPorUnidade),
      'Data de Criação': p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '—',
    }
  })
  const ws = XLSX.utils.json_to_sheet(linhas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')
  XLSX.writeFile(wb, `margemcerta-catalogo-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
