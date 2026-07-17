import { useState } from 'react'
import { FileText, Link2, MessageCircle, Check } from 'lucide-react'
import { calcularPrecificacao, formatBRL, formatPct, MARKETPLACE_LABELS, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import { getCondicoes, getMarketplaces } from '../utils/storageUtils'

export default function ExportButton({
  nomeProduto, setNomeProduto, marketplace, resultados, costs, sliders, unidades,
  categoria, customFees, campanhaShopee,
}) {
  const [copied, setCopied] = useState(false)

  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('pt-BR')
    const nome = nomeProduto || 'produto'
    const mktLabel = MARKETPLACE_LABELS[marketplace] || marketplace
    const temClassicoPremium = MARKETPLACES_COM_CLASSICO_PREMIUM.includes(marketplace)

    let y = 20
    const marginBottom = 275
    const checkPageBreak = (needed) => {
      if (y + needed > marginBottom) {
        doc.addPage()
        y = 20
      }
    }

    doc.setFontSize(20)
    doc.setTextColor(22, 35, 63)
    doc.text('MargemCerta', 20, y)
    y += 7
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Precifique certo. Lucre de verdade.', 20, y)
    y += 5
    doc.setDrawColor(184, 134, 58)
    doc.line(20, y, 190, y)
    y += 13

    doc.setFontSize(14)
    doc.setTextColor(30)
    doc.text(`Produto: ${nome}`, 20, y); y += 8
    doc.setFontSize(11)
    doc.text(`Marketplace: ${mktLabel}`, 20, y); y += 8
    doc.text(`Data: ${date}`, 20, y); y += 14

    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Custos fixos', 20, y); y += 8
    doc.setTextColor(60)
    doc.setFontSize(10)
    doc.text(`Custo do produto: ${formatBRL(costs.custoProduto)}`, 20, y); y += 7
    doc.text(`Frete absorvido: ${formatBRL(costs.freteAbsorvido)}`, 20, y); y += 7
    doc.text(`Outros custos: ${formatBRL(costs.outrosCustos)}`, 20, y); y += 13

    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Custos variáveis', 20, y); y += 8
    doc.setTextColor(60)
    doc.setFontSize(10)
    doc.text(`Ads: ${sliders.ads}%`, 20, y); y += 7
    doc.text(`Imposto: ${sliders.imposto}%`, 20, y); y += 7
    doc.text(`Devolução: ${sliders.devolucao}%`, 20, y); y += 7
    doc.text(`Margem alvo: ${sliders.margemAlvo}%`, 20, y); y += 14

    // ── Resultado(s) — dupla coluna (Clássico/Premium) só quando o marketplace
    // realmente diferencia os dois; caso contrário, um único bloco completo. ──
    const desenharItens = (d, col, startY) => {
      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text('Detalhamento completo (por unidade):', col, startY)
      doc.setTextColor(70)
      let iy = startY + 6
      if (d.faixaPrecoShopee) {
        doc.text(`Faixa de preço Shopee: ${d.faixaPrecoShopee}`, col, iy)
        iy += 5.5
      }
      for (const item of d.detalheTaxas?.itens || []) {
        const pct = formatPct(item.valor / d.precoIdeal)
        doc.text(`${item.label}: ${formatBRL(item.valor)} (${pct})`, col, iy)
        iy += 5.5
      }
      doc.setTextColor(30)
      doc.setFontSize(9.5)
      doc.text(`Preço ideal calculado: ${formatBRL(d.precoIdeal)}`, col, iy + 1.5)
      return iy + 8
    }

    if (temClassicoPremium) {
      checkPageBreak(90)
      let maxItemY = y
      for (const tipo of ['classico', 'premium']) {
        const d = resultados?.[tipo]
        const label = tipo === 'classico' ? 'Clássico' : 'Premium'
        const col = tipo === 'classico' ? 20 : 110

        doc.setFontSize(12)
        doc.setTextColor(184, 134, 58)
        doc.text(`Anúncio ${label}`, col, y)
        doc.setTextColor(60)
        doc.setFontSize(10)
        if (d && !d.error) {
          doc.text(`Preço ideal: ${formatBRL(d.precoIdeal)}`, col, y + 8)
          doc.text(`Lucro/un.: ${formatBRL(d.lucroPorUnidade)}`, col, y + 15)
          doc.text(`Margem real: ${formatPct(d.margemReal)}`, col, y + 22)
          const endY = desenharItens(d, col, y + 30)
          maxItemY = Math.max(maxItemY, endY)
        } else {
          doc.text('Não calculado', col, y + 8)
        }
      }
      y = maxItemY + 6
    } else {
      const d = resultados?.classico?.melhorOpcao ? resultados.classico : resultados?.premium
      checkPageBreak(60)
      doc.setFontSize(12)
      doc.setTextColor(184, 134, 58)
      doc.text('Resultado', 20, y)
      doc.setTextColor(60)
      doc.setFontSize(10)
      if (d && !d.error) {
        doc.text(`Preço ideal: ${formatBRL(d.precoIdeal)}`, 20, y + 8)
        doc.text(`Lucro/un.: ${formatBRL(d.lucroPorUnidade)}`, 20, y + 15)
        doc.text(`Margem real: ${formatPct(d.margemReal)}`, 20, y + 22)
        y = desenharItens(d, 20, y + 30) + 6
      } else {
        doc.text('Não calculado', 20, y + 8)
        y += 16
      }
    }

    // ── Projeção mensal ──
    const melhor = resultados?.classico?.melhorOpcao ? resultados.classico : resultados?.premium
    checkPageBreak(30)
    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Projeção mensal', 20, y); y += 8
    doc.setTextColor(60)
    doc.setFontSize(10)
    if (melhor && !melhor.error) {
      doc.text(`Volume: ${unidades} unidades/mês`, 20, y); y += 7
      doc.text(`Lucro mensal: ${formatBRL(melhor.lucroPorUnidade * unidades)}`, 20, y); y += 7
    }
    y += 8

    // ── Comparativo entre marketplaces ──
    const condicoesAtivas = getCondicoes()
    const comparativo = getMarketplaces(condicoesAtivas)
      .map(mkt => {
        const resultado = calcularPrecificacao({
          ...costs,
          marketplace: mkt.id,
          categoria: categoria || null,
          ...sliders,
          condicoes: condicoesAtivas,
          customFees: mkt.id === marketplace ? customFees : null,
          campanhaShopee: mkt.id === 'shopee' && mkt.id === marketplace && campanhaShopee,
        })
        const cl = resultado?.classico
        const pr = resultado?.premium
        let melhorLinha = null, tipoLinha = null
        if (cl && !cl.error && pr && !pr.error) {
          if (cl.margemReal >= pr.margemReal) { melhorLinha = cl; tipoLinha = 'Clássico' } else { melhorLinha = pr; tipoLinha = 'Premium' }
        } else if (cl && !cl.error) { melhorLinha = cl; tipoLinha = 'Clássico' }
        else if (pr && !pr.error) { melhorLinha = pr; tipoLinha = 'Premium' }
        if (melhorLinha && !MARKETPLACES_COM_CLASSICO_PREMIUM.includes(mkt.id)) tipoLinha = '—'
        return { mkt, melhor: melhorLinha, tipo: tipoLinha }
      })
      .filter(l => l.melhor != null)
      .sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)

    if (comparativo.length > 0) {
      checkPageBreak(20 + comparativo.length * 7)
      doc.setFontSize(12)
      doc.setTextColor(184, 134, 58)
      doc.text('Comparativo entre marketplaces', 20, y); y += 9

      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text('Marketplace', 20, y)
      doc.text('Anúncio', 62, y)
      doc.text('Taxa', 87, y)
      doc.text('Preço ideal', 108, y)
      doc.text('Margem', 140, y)
      doc.text('Lucro/un.', 167, y)
      y += 5
      doc.setDrawColor(220)
      doc.line(20, y, 190, y)
      y += 5

      doc.setFontSize(9.5)
      for (const { mkt, melhor: melhorLinha, tipo } of comparativo) {
        checkPageBreak(7)
        const isMelhor = mkt.id === comparativo[0].mkt.id
        doc.setTextColor(isMelhor ? 22 : 70, isMelhor ? 120 : 70, isMelhor ? 70 : 70)
        doc.setFont(undefined, isMelhor ? 'bold' : 'normal')
        doc.text(`${mkt.label}${isMelhor ? ' (melhor)' : ''}`, 20, y)
        doc.text(tipo, 62, y)
        doc.text(formatPct(melhorLinha.detalheTaxas.taxaMarketplace), 87, y)
        doc.text(formatBRL(melhorLinha.precoIdeal), 108, y)
        doc.text(formatPct(melhorLinha.margemReal), 140, y)
        doc.text(formatBRL(melhorLinha.lucroPorUnidade), 167, y)
        doc.setFont(undefined, 'normal')
        y += 6.5
      }
      y += 4

      doc.setFontSize(8)
      doc.setTextColor(130)
      const explicacao = doc.splitTextToSize(
        'Todos os marketplaces são calculados para a mesma margem líquida alvo. A diferença no preço ideal vem da taxa aplicada (comissão %), de custos fixos extras por venda (taxa fixa na Shopee, ou frete obrigatório abaixo de R$79 no Mercado Livre) e do custo de transação: no Mercado Livre incide por fora (Mercado Pago, ~4,99%); na Shopee já vem embutido na comissão.',
        170
      )
      checkPageBreak(explicacao.length * 4.5 + 4)
      doc.text(explicacao, 20, y)
      y += explicacao.length * 4.5 + 4
    }

    checkPageBreak(10)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Gerado com MargemCerta — margem-certa.vercel.app', 20, Math.max(y, 285))

    const safeName = nome.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    doc.save(`margem-certa-${safeName}-${date.replace(/\//g, '-')}.pdf`)
  }

  const handleShare = () => {
    const params = new URLSearchParams({
      mkt: marketplace,
      custo: costs.custoProduto,
      frete: costs.freteAbsorvido,
      outros: costs.outrosCustos,
      ads: sliders.ads,
      imp: sliders.imposto,
      dev: sliders.devolucao,
      margem: sliders.margemAlvo,
    })
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const whatsappMsg = encodeURIComponent(
    `Calculei o preço ideal do meu produto no MargemCerta! Experimenta também: ${window.location.origin}`
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <div className="mb-4">
        <label htmlFor="nomeProduto" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do produto (para o PDF)
        </label>
        <input
          id="nomeProduto"
          type="text"
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)}
          placeholder="Ex: Camiseta estampada P"
          className="w-full border border-gray-200 focus:border-brass-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          aria-label="Nome do produto para exportação"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePDF}
          className="flex items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" strokeWidth={2} /> Exportar PDF
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
        >
          {copied ? <><Check className="w-4 h-4" strokeWidth={2} /> Link copiado!</> : <><Link2 className="w-4 h-4" strokeWidth={2} /> Compartilhar link</>}
        </button>
        <a
          href={`https://wa.me/?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-brass-100 hover:bg-brass-100/70 text-brass-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2} /> WhatsApp
        </a>
      </div>
    </div>
  )
}
