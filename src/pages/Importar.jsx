import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseFile, generateTemplate } from '../utils/importUtils'

const PREVIEW_COLS = ['sku', 'nome_produto', 'marketplace', 'categoria', 'custo_produto', 'ads', 'imposto', 'devolucao', 'margem_alvo']
const COL_LABELS = {
  sku: 'SKU',
  nome_produto: 'Produto',
  marketplace: 'Marketplace',
  categoria: 'Categoria',
  custo_produto: 'Custo (R$)',
  ads: 'Ads (%)',
  imposto: 'Imposto (%)',
  devolucao: 'Devolução (%)',
  margem_alvo: 'Margem (%)',
}

export default function Importar() {
  const navigate = useNavigate()
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [parseError, setParseError] = useState('')

  function downloadTemplate() {
    const content = generateTemplate()
    const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_margem_certa.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function processFile(file) {
    setLoading(true)
    setParseError('')
    setResultado(null)
    try {
      const res = await parseFile(file)
      setResultado(res)
    } catch (e) {
      setParseError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function onFileInput(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function calcular() {
    if (!resultado?.valid?.length) return
    sessionStorage.setItem('margem-certa-import', JSON.stringify(resultado.valid))
    navigate('/resultados')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Importar Produtos em Massa</h1>
          <p className="text-gray-500 text-sm">
            Faça upload de uma planilha com seus produtos para calcular a margem de todos de uma vez.
          </p>
        </div>

        {/* Step 1: Download template */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">1</span>
            Baixe o template
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Use o arquivo de exemplo para preencher seus produtos no formato correto.
            Aceita <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.txt</strong>.
          </p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 border border-green-500 text-green-700 hover:bg-green-50 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar template CSV
          </button>
        </div>

        {/* Step 2: Upload */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">2</span>
            Faça o upload da planilha
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-1">.csv, .xlsx, .xls, .txt</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              className="hidden"
              onChange={onFileInput}
            />
          </div>

          {loading && (
            <p className="text-center text-sm text-gray-500 mt-4">Processando arquivo...</p>
          )}

          {parseError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {parseError}
            </div>
          )}
        </div>

        {/* Step 3: Preview */}
        {resultado && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">3</span>
              Preview dos dados
            </h2>

            {/* Contador */}
            <div className="flex flex-wrap gap-3 mb-4 mt-2">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                {resultado.valid.length} produto{resultado.valid.length !== 1 ? 's' : ''} válido{resultado.valid.length !== 1 ? 's' : ''}
              </span>
              {resultado.errors.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {resultado.errors.length} erro{resultado.errors.length !== 1 ? 's' : ''}
                </span>
              )}
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                {resultado.total} linha{resultado.total !== 1 ? 's' : ''} no arquivo
              </span>
            </div>

            {/* Erros */}
            {resultado.errors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                {resultado.errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}

            {/* Tabela preview */}
            {resultado.valid.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                    <tr>
                      {PREVIEW_COLS.map(col => (
                        <th key={col} className="px-3 py-2.5 text-left whitespace-nowrap">{COL_LABELS[col]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultado.valid.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {PREVIEW_COLS.map(col => (
                          <td key={col} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                            {row[col] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {resultado.valid.length > 5 && (
                  <p className="text-xs text-gray-400 px-3 py-2 border-t border-gray-100">
                    … e mais {resultado.valid.length - 5} produto(s) não exibido(s) no preview.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Calcular */}
        {resultado?.valid?.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={calcular}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              Calcular todos os produtos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
