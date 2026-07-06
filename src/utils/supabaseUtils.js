/**
 * supabaseUtils.js
 * Integração com Supabase para registro de visitantes da demo e coleta de feedback.
 *
 * CONFIGURAÇÃO (Vercel):
 *  - Crie um projeto gratuito em https://supabase.com
 *  - No Supabase, execute o SQL em /supabase/schema.sql para criar as tabelas
 *  - Adicione as variáveis no painel Vercel (Settings → Environment Variables):
 *      VITE_SUPABASE_URL   = https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON  = eyJ...
 */

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON)

// ── Visitor ID local ──────────────────────────────────────────────────────────

const VISITOR_KEY   = 'mc-visitor-id'
const VISITOR_DATA_KEY = 'mc-visitor-data'

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function getLocalVisitorData() {
  try {
    const raw = localStorage.getItem(VISITOR_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setLocalVisitorData(data) {
  localStorage.setItem(VISITOR_DATA_KEY, JSON.stringify(data))
}

// ── REST helper ───────────────────────────────────────────────────────────────

async function supabaseRequest(path, method = 'GET', body = null) {
  if (!isConfigured) return { data: null, error: 'Supabase not configured' }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer':        method === 'POST' ? 'return=representation' : '',
      },
      body: body ? JSON.stringify(body) : null,
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    if (!res.ok) return { data: null, error: data }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// ── Visitantes ────────────────────────────────────────────────────────────────

/**
 * Registra (ou atualiza) o visitante na tabela `visitors`.
 * @param {{ name: string, email?: string }} info
 * @returns {Promise<{ data, error }>}
 */
export async function registerVisitor({ name, email = '' }) {
  const id = getVisitorId()
  const payload = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    visited_at: new Date().toISOString(),
    user_agent: navigator.userAgent.slice(0, 200),
  }
  setLocalVisitorData({ id, name, email })

  if (!isConfigured) return { data: payload, error: null }

  // upsert (insere ou atualiza se o id já existir)
  return supabaseRequest(
    'visitors?on_conflict=id',
    'POST',
    payload,
  )
}

/**
 * Incrementa o contador de produtos calculados para o visitante atual.
 */
export async function trackProductCalculated(productSnapshot = {}) {
  if (!isConfigured) return
  const id = getVisitorId()
  // Insere na tabela de eventos de produtos
  supabaseRequest('product_events', 'POST', {
    visitor_id: id,
    snapshot: productSnapshot,
    created_at: new Date().toISOString(),
  })
}

// ── Feedback / Survey ─────────────────────────────────────────────────────────

/**
 * Salva as respostas da pesquisa exploratória e avaliação da ferramenta.
 * @param {{
 *   q1: string,   // Como descobre lucro/prejuízo hoje
 *   q2: string,   // Já perdeu dinheiro? O que aconteceu?
 *   q3: string,   // Última vez que calculou preço
 *   helped: 'sim'|'não'|'parcialmente',
 *   rating: number, // 1-5
 *   comment: string,
 * }} answers
 */
export async function saveFeedback(answers) {
  const visitorId = getVisitorId()
  const payload = {
    visitor_id: visitorId,
    ...answers,
    created_at: new Date().toISOString(),
  }

  // Salva localmente também
  try {
    const prev = JSON.parse(localStorage.getItem('mc-feedbacks') || '[]')
    prev.push(payload)
    localStorage.setItem('mc-feedbacks', JSON.stringify(prev))
  } catch { /* ignore */ }

  if (!isConfigured) return { data: payload, error: null }
  return supabaseRequest('feedback', 'POST', payload)
}

// ── Admin — leitura de dados ──────────────────────────────────────────────────

export async function fetchVisitors() {
  if (!isConfigured) return { data: [], error: 'Supabase not configured' }
  return supabaseRequest('visitors?order=visited_at.desc&limit=500')
}

export async function fetchFeedbacks() {
  if (!isConfigured) return { data: [], error: 'Supabase not configured' }
  return supabaseRequest('feedback?order=created_at.desc&limit=500')
}

export async function fetchProductEvents() {
  if (!isConfigured) return { data: [], error: 'Supabase not configured' }
  return supabaseRequest('product_events?order=created_at.desc&limit=1000')
}

export { isConfigured }
