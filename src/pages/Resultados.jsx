import { useState, useEffect, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { calcularPrecificacao, formatBRL, formatPct, getDiagnostico } from '../utils/pricingLogic'
import { getCondicoes } from '../utils/storageUtils'

const MARKETPLACE_LABELS = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  amazon: 'Amazon',
  magalu: 'Magalu',
  americanas: 'Americanas',
}

const FILTROS = ['Todos', 'Saudáveis', 'Atenção', 'Críticos']
const FILTRO_NIVEL = { 'Saudáveis': 'saudavel', 'Atenção': 'atencao', 'Críticos': 'critico' }

function DiagnoseBadge({ nivel }) {
  const styles = {
    saudavel: 'bg-green-100 text-green-700',
    atencao: 'bg-orange-100 text-orange-700',
    critico: 'bg-red-100 text-red-700',
  }
  const labels = { saudavel: 'Saudável', atencao: 'Atenção', critico: 'Crítico' }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[nivel]}`}>
      {labels[nivel]}
    </span>
  )
}

export default function Resultados() {
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [sortCol, setSortCol] = useState('nome_produto')
  const [sortDir, setSortDir] = useState('asc')

  const produtos = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('margem-certa-import')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }, [])

  useEffect(() => {
    if (!produtos.length) navigate('/importar')
  }, [produtos, navigate])

  const condicoes = useMemo(() => getCondicoes(), [])

  const resultados = useMemo(() => {
    return produtos.map(p => {
      const calc = calcularPrecificacao({
        custoProduto: p.custo_produto,
        custoEmbalagem: p.custo_embalagem,
        freteAbsorvido: p.frete_absorvido,
        outrosCustos: p.outros_custos,
        marketplace: p.marketplace,
        categoria: p.categoria,
        ads: p.ads,
        imposto: p.imposto,
        devolucao: p.devolucao,
        margemAlvo: p.margem_alvo,
        condicoes,
      })

      const melhor = calc.classico?.melhorOpcao ? calc.classico
        : calc.premium?.melhorOpcao ? calc.premium
        : calc.classico && !calc.classico.error ? calc.classico
        : calc.premium && !calc.premium.error ? calc.premium
        : null

      const diag = melhor ? getDiagnostico(melhor.margemReal, p.margem_alvo) : null

      return { produto: p, calc, melhor, diag }
    })
  }, [produtos, condicoes])

  // Contadores para os cards de resumo
  const contadores = useMemo(() => {
    let criticos = 0, atencao = 0, saudaveis = 0, somaMargens = 0, countMargens = 0
    resultados.forEach(({ diag, melhor }) => {
      if (!diag) return
      if (diag.nivel === 'critico') criticos++
      else if (diag.nivel === 'atencao') atencao++
      else saudaveis++
      if (melhor) { somaMargens += melhor.margemReal; countMargens++ }
    })
    return { criticos, atencao, saudaveis, mediaMargemPct: countMargens ? (somaMargens / countMargens) * 100 : 0 }
  }, [resultados])

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtrados = useMemo(() => {
    let list = [...resultados]
    if (filtro !== 'Todos') {
      const nivel = FILTRO_NIVEL[filtro]
      list = list.filter(r => r.diag?.nivel === nivel)
    }
    list.sort((a, b) => {
      let av, bv
      if (sortCol === 'nome_produto') { av = a.produto.nome_produto; bv = b.produto.nome_produto }
      else if (sortCol === 'marketplace') { av = a.produto.marketplace; bv = b.produto.marketplace }
      else if (sortCol === 'preco') { av = a.melhor?.precoIdeal ?? 0; bv = b.melhor?.precoIdeal ?? 0 }
      else if (sortCol === 'margem') { av = a.melhor?.margemReal ?? -1; bv = b.melhor?.margemReal ?? -1 }
      else { av = 0; bv = 0 }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [resultados, filtro, sortCol, sortDir])

  function exportCSV() {
    const rows = [
      ['SKU','Produto','Marketplace','Categoria','Preço Clássico','Margem Clássico','Preço Premium','Margem Premium','Diagnóstico'],
      ...resultados.map(({ produto: p, calc, diag }) => [
        p.sku || '',
        p.nome_produto,
        MARKETPLACE_LABELS[p.marketplace] || p.marketplace,
        p.categoria || '',
        calc.classico?.error ? 'Erro' : (calc.classico?.precoIdeal?.toFixed(2) || ''),
        calc.classico?.error ? '' : formatPct(calc.classico?.margemReal),
        calc.premium?.error ? 'Erro' : (calc.premium?.precoIdeal?.toFixed(2) || ''),
        calc.premium?.error ? '' : formatPct(calc.premium?.margemReal),
        diag?.titulo || '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resultados_margem_certa.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-brass-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-950 mb-1">Resultados em Massa</h1>
            <p className="text-gray-500 text-sm">{resultados.length} produto(s) calculado(s)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/importar')}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Nova importação
            </button>
            <button
              onClick={exportCSV}
              className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{resultados.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total de produtos</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{contadores.mediaMargemPct.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Margem média</p>
          </div>
          <div
            className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-4 text-center cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => setFiltro(f => f === 'Críticos' ? 'Todos' : 'Críticos')}
          >
            <p className="text-2xl font-bold text-red-700">{contadores.criticos}</p>
            <p className="text-xs text-red-500 mt-1">Críticos</p>
          </div>
          <div
            className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-4 text-center cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => setFiltro(f => f === 'Saudáveis' ? 'Todos' : 'Saudáveis')}
          >
            <p className="text-2xl font-bold text-green-700">{contadores.saudaveis}</p>
            <p className="text-xs text-green-500 mt-1">Saudáveis</p>
          </div>
        </div>

        {/* Filtro tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                filtro === f
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brass-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => toggleSort('nome_produto')}>
                    Produto <SortIcon col="nome_produto" />
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => toggleSort('marketplace')}>
                    Marketplace <SortIcon col="marketplace" />
                  </th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => toggleSort('preco')}>
                    Preço ideal <SortIcon col="preco" />
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer select-none" onClick={() => toggleSort('margem')}>
                    Margem real <SortIcon col="margem" />
                  </th>
                  <th className="px-4 py-3 text-center">Diagnóstico</th>
                  <th className="px-4 py-3 text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(({ produto: p, calc, melhor, diag }, i) => {
                  const isOpen = expandido === i
                  return (
                    <Fragment key={i}>
                      <tr className={`hover:bg-gray-50 ${isOpen ? 'bg-brass-100/30' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{p.nome_produto}</p>
                          {p.sku && <p className="text-xs text-gray-400 mt-0.5">{p.sku}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{MARKETPLACE_LABELS[p.marketplace] || p.marketplace}</td>
                        <td className="px-4 py-3 text-gray-500">{p.categoria || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {melhor ? formatBRL(melhor.precoIdeal) : <span className="text-red-400 text-xs">Erro</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {melhor ? (
                            <span className={melhor.margemReal >= 0.05 ? 'text-green-700' : 'text-red-600'}>
                              {formatPct(melhor.margemReal)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {diag ? <DiagnoseBadge nivel={diag.nivel} /> : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpandido(isOpen ? null : i)}
                            className="text-brass-600 hover:text-brass-700 text-xs font-medium"
                          >
                            {isOpen ? 'Fechar' : 'Ver mais'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-brass-100/30">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {['classico', 'premium'].map(tipo => {
                                const r = calc[tipo]
                                if (!r) return null
                                if (r.error) return (
                                  <div key={tipo} className="bg-red-50 rounded-xl p-4 text-sm text-red-600">
                                    <p className="font-semibold capitalize mb-1">{tipo}</p>
                                    <p>{r.error}</p>
                                  </div>
                                )
                                return (
                                  <div key={tipo} className={`rounded-xl p-4 text-sm ${r.melhorOpcao ? 'bg-white border-2 border-green-400 shadow-sm' : 'bg-white border border-gray-200'}`}>
                                    <p className="font-semibold text-gray-800 capitalize mb-3 flex items-center gap-2">
                                      {tipo}
                                      {r.melhorOpcao && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Melhor opção</span>}
                                    </p>
                                    <div className="space-y-1 text-gray-600">
                                      <div className="flex justify-between"><span>Preço ideal</span><span className="font-semibold text-gray-900">{formatBRL(r.precoIdeal)}</span></div>
                                      <div className="flex justify-between"><span>Comissão marketplace</span><span>{formatBRL(r.feeEmReais)}</span></div>
                                      <div className="flex justify-between"><span>Lucro por unidade</span><span className="font-semibold text-green-700">{formatBRL(r.lucroPorUnidade)}</span></div>
                                      <div className="flex justify-between"><span>Margem real</span><span className="font-semibold">{formatPct(r.margemReal)}</span></div>
                                      <div className="flex justify-between"><span>Markup total</span><span>{formatPct(r.markup)}</span></div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {diag && (
                              <div className={`mt-4 rounded-xl p-3 text-sm ${
                                diag.nivel === 'critico' ? 'bg-red-50 text-red-700'
                                : diag.nivel === 'atencao' ? 'bg-orange-50 text-orange-700'
                                : 'bg-green-50 text-green-700'
                              }`}>
                                <strong>{diag.titulo}</strong> {diag.acao}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      Nenhum produto encontrado para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  )
}
