import { useState } from 'react'
import { FileText, Link2, MessageCircle, Check } from 'lucide-react'
import { formatBRL, formatPct, MARKETPLACE_LABELS } from '../utils/pricingLogic'

export default function ExportButton({ nomeProduto, setNomeProduto, marketplace, resultados, costs, sliders, unidades }) {
  const [copied, setCopied] = useState(false)

  const handlePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('pt-BR')
    const nome = nomeProduto || 'produto'
    const mktLabel = MARKETPLACE_LABELS[marketplace] || marketplace

    doc.setFontSize(20)
    doc.setTextColor(22, 35, 63)
    doc.text('MargemCerta', 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Precifique certo. Lucre de verdade.', 20, 27)

    doc.setDrawColor(184, 134, 58)
    doc.line(20, 32, 190, 32)

    doc.setFontSize(14)
    doc.setTextColor(30)
    doc.text(`Produto: ${nome}`, 20, 45)
    doc.setFontSize(11)
    doc.text(`Marketplace: ${mktLabel}`, 20, 53)
    doc.text(`Data: ${date}`, 20, 61)

    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Custos fixos', 20, 75)
    doc.setTextColor(60)
    doc.setFontSize(10)
    doc.text(`Custo do produto: ${formatBRL(costs.custoProduto)}`, 20, 83)
    doc.text(`Embalagem: ${formatBRL(costs.custoEmbalagem)}`, 20, 90)
    doc.text(`Frete absorvido: ${formatBRL(costs.freteAbsorvido)}`, 20, 97)
    doc.text(`Outros custos: ${formatBRL(costs.outrosCustos)}`, 20, 104)

    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Custos variáveis', 20, 118)
    doc.setTextColor(60)
    doc.setFontSize(10)
    doc.text(`Ads: ${sliders.ads}%`, 20, 126)
    doc.text(`Imposto: ${sliders.imposto}%`, 20, 133)
    doc.text(`Devolução: ${sliders.devolucao}%`, 20, 140)
    doc.text(`Margem alvo: ${sliders.margemAlvo}%`, 20, 147)

    let maxItemY = 195
    for (const tipo of ['classico', 'premium']) {
      const d = resultados?.[tipo]
      const label = tipo === 'classico' ? 'Clássico' : 'Premium'
      const col = tipo === 'classico' ? 20 : 110

      doc.setFontSize(12)
      doc.setTextColor(184, 134, 58)
      doc.text(`Anúncio ${label}`, col, 165)
      doc.setTextColor(60)
      doc.setFontSize(10)
      if (d && !d.error) {
        doc.text(`Preço ideal: ${formatBRL(d.precoIdeal)}`, col, 173)
        doc.text(`Lucro/un.: ${formatBRL(d.lucroPorUnidade)}`, col, 180)
        doc.text(`Margem real: ${formatPct(d.margemReal)}`, col, 187)

        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text('Detalhamento de taxas (por unidade):', col, 195)
        doc.setTextColor(70)
        let y = 201
        for (const item of d.detalheTaxas?.itens || []) {
          doc.text(`${item.label}: ${formatBRL(item.valor)}`, col, y)
          y += 5.5
        }
        maxItemY = Math.max(maxItemY, y)
      } else {
        doc.text('Não calculado', col, 173)
      }
    }

    const projY = maxItemY + 8
    doc.setFontSize(12)
    doc.setTextColor(184, 134, 58)
    doc.text('Projeção mensal', 20, projY)
    doc.setTextColor(60)
    doc.setFontSize(10)
    const melhor = resultados?.classico?.melhorOpcao ? resultados.classico : resultados?.premium
    if (melhor && !melhor.error) {
      doc.text(`Volume: ${unidades} unidades/mês`, 20, projY + 8)
      doc.text(`Lucro mensal: ${formatBRL(melhor.lucroPorUnidade * unidades)}`, 20, projY + 15)
    }

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Gerado com MargemCerta — margem-certa.vercel.app', 20, 285)

    const safeName = nome.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    doc.save(`margem-certa-${safeName}-${date.replace(/\//g, '-')}.pdf`)
  }

  const handleShare = () => {
    const params = new URLSearchParams({
      mkt: marketplace,
      custo: costs.custoProduto,
      emb: costs.custoEmbalagem,
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
