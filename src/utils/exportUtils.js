import * as XLSX from 'xlsx'
import { calcularMelhorOferta } from './pricingLogic'
import { getMarketplaceLabel } from './storageUtils'

export function exportarCatalogoXLSX(produtos) {
  const linhas = produtos.map(p => {
    const melhor = calcularMelhorOferta(p)
    return {
      'Produto': p.nome,
      'Marketplace': getMarketplaceLabel(p.marketplace),
      'Preço Ideal (R$)': melhor ? Number(melhor.precoIdeal.toFixed(2)) : null,
      'Margem Real (%)': melhor ? Number((melhor.margemReal * 100).toFixed(1)) : null,
      'Custo do Produto (R$)': p.costs?.custoProduto ?? null,
      'Comissão Marketplace (R$)': melhor ? Number(melhor.feeEmReais.toFixed(2)) : null,
      'Imposto (R$)': melhor ? Number((melhor.detalheTaxas.taxaImposto * melhor.precoIdeal).toFixed(2)) : null,
      'Data de Criação': p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '—',
    }
  })
  const ws = XLSX.utils.json_to_sheet(linhas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')
  XLSX.writeFile(wb, `margemcerta-catalogo-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
