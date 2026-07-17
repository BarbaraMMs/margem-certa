/**
 * Admin.jsx
 * Painel de gestão da demo — acessível em /admin
 * Protegido por senha simples definida via variável de ambiente VITE_ADMIN_PASS
 * (padrão: "margem2024" se não configurada)
 *
 * Exibe:
 *  • Resumo: total de visitantes, produtos calculados, feedbacks
 *  • Tabela de visitantes com data, nome, email
 *  • Feedbacks com respostas exploratórias, nota e comentário
 *  • Exportação CSV
 */
import { useState, useEffect, useCallback } from 'react'
import { Users, Star, MessageSquare, Package, Download, RefreshCw, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { fetchVisitors, fetchFeedbacks, fetchProductEvents, isConfigured } from '../utils/supabaseUtils'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'margem2024'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function exportCSV(rows, filename) {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(';')),
  ].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Admin() {
  const [authed,   setAuthed]   = useState(false)
  const [pass,     setPass]     = useState('')
  const [passErr,  setPassErr]  = useState(false)

  const [visitors, setVisitors] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(false)

  // Expand / collapse feedback rows
  const [expanded, setExpanded] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const [v, f, e] = await Promise.all([fetchVisitors(), fetchFeedbacks(), fetchProductEvents()])
    setVisitors(v.data || [])
    setFeedbacks(f.data || [])
    setEvents(e.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  function handleLogin(e) {
    e.preventDefault()
    if (pass === ADMIN_PASS) { setAuthed(true); setPassErr(false) }
    else setPassErr(true)
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-brass-600" />
            <h1 className="text-lg font-bold text-gray-800">Painel Admin — MargemCerta</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setPassErr(false) }}
              placeholder="Senha de acesso"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brass-400
                ${passErr ? 'border-red-400' : 'border-gray-200'}`}
              autoFocus
            />
            {passErr && <p className="text-red-500 text-xs">Senha incorreta.</p>}
            <button
              type="submit"
              className="w-full bg-ink-900 hover:bg-ink-800 text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              Entrar
            </button>
          </form>
          {!isConfigured && (
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg p-3 leading-relaxed">
              ⚠️ Supabase não configurado. Configure as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON</code> no Vercel para ver dados reais.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── Métricas ───────────────────────────────────────────────────────────────
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length || 0).toFixed(1)
    : '—'

  const helpedCounts = feedbacks.reduce((acc, f) => {
    if (f.helped) acc[f.helped] = (acc[f.helped] || 0) + 1
    return acc
  }, {})

  // Produtos por visitante
  const eventsByVisitor = events.reduce((acc, ev) => {
    acc[ev.visitor_id] = (acc[ev.visitor_id] || 0) + 1
    return acc
  }, {})

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📊 Painel de Demo — MargemCerta</h1>
          <p className="text-xs text-gray-400">Gestão de visitantes, produtos calculados e feedbacks</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-brass-700 hover:text-brass-800 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<Users className="w-5 h-5 text-emerald-500" />}
            label="Visitantes" value={visitors.length} />
          <KpiCard icon={<Package className="w-5 h-5 text-blue-500" />}
            label="Produtos calculados" value={events.length} />
          <KpiCard icon={<MessageSquare className="w-5 h-5 text-purple-500" />}
            label="Feedbacks" value={feedbacks.length} />
          <KpiCard icon={<Star className="w-5 h-5 text-yellow-500" />}
            label="Nota média" value={avgRating} suffix="/ 5" />
        </div>

        {/* "A ferramenta ajudou?" */}
        {feedbacks.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">
              🎯 A ferramenta ajudou a ter visão mais clara?
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'sim',          label: '✅ Sim',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { key: 'parcialmente', label: '🤔 Parcialmente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { key: 'não',          label: '😐 Não muito',    color: 'bg-red-50 text-red-700 border-red-200' },
              ].map(({ key, label, color }) => (
                <div key={key} className={`border rounded-lg px-4 py-2 text-sm font-medium ${color}`}>
                  {label}: <strong>{helpedCounts[key] || 0}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela de visitantes */}
        <Section
          title="👥 Visitantes"
          count={visitors.length}
          onExport={() => exportCSV(visitors, 'visitantes.csv')}
        >
          {visitors.length === 0 ? (
            <Empty text={isConfigured ? 'Nenhum visitante registrado ainda.' : 'Configure o Supabase para ver dados.'} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <Th>Nome</Th>
                  <Th>E-mail</Th>
                  <Th>Data de acesso</Th>
                  <Th>Produtos calculados</Th>
                </tr>
              </thead>
              <tbody>
                {visitors.map(v => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                    <Td><span className="font-medium text-gray-800">{v.name || '—'}</span></Td>
                    <Td>{v.email || <span className="text-gray-400 italic">não informado</span>}</Td>
                    <Td className="text-gray-500">{formatDate(v.visited_at)}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Package className="w-3 h-3" /> {eventsByVisitor[v.id] || 0}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Feedbacks */}
        <Section
          title="💬 Feedbacks e pesquisa exploratória"
          count={feedbacks.length}
          onExport={() => exportCSV(feedbacks, 'feedbacks.csv')}
        >
          {feedbacks.length === 0 ? (
            <Empty text={isConfigured ? 'Nenhum feedback recebido ainda.' : 'Configure o Supabase para ver dados.'} />
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f, i) => {
                const isOpen = expanded[i]
                const visitor = visitors.find(v => v.id === f.visitor_id)
                return (
                  <div key={i} className="border rounded-xl overflow-hidden">
                    {/* Header */}
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800 text-sm">
                          {visitor?.name || 'Anônimo'}
                        </span>
                        {f.rating > 0 && (
                          <Stars rating={f.rating} />
                        )}
                        {f.helped && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            f.helped === 'sim'          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            f.helped === 'parcialmente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                          'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {f.helped === 'sim' ? '✅ Ajudou' : f.helped === 'parcialmente' ? '🤔 Parcial' : '😐 Não muito'}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(f.created_at)}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Body */}
                    {isOpen && (
                      <div className="px-5 py-4 space-y-4 bg-white">
                        {f.q1 && <QA q="Como descobre lucro/prejuízo hoje?" a={f.q1} />}
                        {f.q2 && <QA q="Já perdeu dinheiro em alguma venda?" a={f.q2} />}
                        {f.q3 && <QA q="Última vez que calculou o preço de um produto" a={f.q3} />}
                        {f.comment && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-emerald-700 mb-1">💬 Comentário livre</p>
                            <p className="text-sm text-gray-700">{f.comment}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {!isConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
            <p className="font-semibold mb-1">⚙️ Como configurar o banco de dados</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>Crie um projeto gratuito em <strong>supabase.com</strong></li>
              <li>Execute o SQL do arquivo <code>supabase/schema.sql</code> no SQL Editor do Supabase</li>
              <li>Adicione no Vercel em <em>Settings → Environment Variables</em>:
                <ul className="ml-6 mt-1 space-y-0.5 font-mono text-xs">
                  <li>VITE_SUPABASE_URL = https://xxxx.supabase.co</li>
                  <li>VITE_SUPABASE_ANON = eyJ...</li>
                  <li>VITE_ADMIN_PASS = sua-senha-secreta</li>
                </ul>
              </li>
              <li>Faça redeploy no Vercel</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, suffix }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-3xl font-bold text-gray-800">{value}
        {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

function Section({ title, count, onExport, children }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-sm font-bold text-gray-800">{title}
          <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">{count}</span>
        </h2>
        {count > 0 && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brass-700 font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Th({ children }) {
  return <th className="pb-2 pr-4 font-semibold">{children}</th>
}

function Td({ children, className = '' }) {
  return <td className={`py-2.5 pr-4 ${className}`}>{children}</td>
}

function Empty({ text }) {
  return <p className="text-sm text-gray-400 text-center py-4">{text}</p>
}

function QA({ q, a }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{q}</p>
      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{a}</p>
    </div>
  )
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}
