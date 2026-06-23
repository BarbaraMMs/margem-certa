const STORAGE_KEY = 'margem-certa-condicoes'
const MKT_LABELS_KEY = 'margem-certa-mkt-labels'

export const BUILT_IN_LABELS = {
  mercadolivre: 'Mercado Livre',
  shopee:       'Shopee',
  amazon:       'Amazon',
  magalu:       'Magalu',
  americanas:   'Americanas',
}

export const BUILT_IN_EMOJIS = {
  mercadolivre: '🛒',
  shopee:       '🟠',
  amazon:       '📦',
  magalu:       '🛍️',
  americanas:   '🔴',
}

export const DEFAULT_CONDITIONS = [
  // ── Mercado Livre — por categoria ──────────────────────────────────────────
  { marketplace: 'mercadolivre', categoria: 'Eletrônicos, Áudio e Vídeo',    classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Informática',                    classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Telefonia e Celulares',          classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Eletrodomésticos',               classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Moda e Acessórios',              classico: 0.16, premium: 0.21 },
  { marketplace: 'mercadolivre', categoria: 'Calçados',                       classico: 0.16, premium: 0.21 },
  { marketplace: 'mercadolivre', categoria: 'Beleza e Cuidado Pessoal',       classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Casa, Móveis e Decoração',       classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Esportes e Fitness',             classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Brinquedos e Hobbies',           classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Saúde',                          classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Alimentos e Bebidas',            classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Bebês',                          classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Animais',                        classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Ferramentas e Construção',       classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Veículos e Motores',             classico: 0.12, premium: 0.17 },
  { marketplace: 'mercadolivre', categoria: 'Autopeças',                      classico: 0.12, premium: 0.17 },
  { marketplace: 'mercadolivre', categoria: 'Livros e Revistas',              classico: 0.03, premium: 0.03 },
  { marketplace: 'mercadolivre', categoria: 'Outras categorias',              classico: 0.13, premium: 0.18 },

  // ── Shopee — taxa única por categoria (sem distinção premium) ───────────────
  { marketplace: 'shopee', categoria: 'Celulares e Acessórios',  classico: 0.05, premium: 0.05 },
  { marketplace: 'shopee', categoria: 'Eletrônicos',              classico: 0.05, premium: 0.05 },
  { marketplace: 'shopee', categoria: 'Casa e Decoração',         classico: 0.06, premium: 0.06 },
  { marketplace: 'shopee', categoria: 'Moda e Acessórios',        classico: 0.07, premium: 0.07 },
  { marketplace: 'shopee', categoria: 'Beleza e Cuidados',        classico: 0.07, premium: 0.07 },
  { marketplace: 'shopee', categoria: 'Brinquedos',               classico: 0.06, premium: 0.06 },
  { marketplace: 'shopee', categoria: 'Esportes e Lazer',         classico: 0.06, premium: 0.06 },
  { marketplace: 'shopee', categoria: 'Outras categorias',        classico: 0.06, premium: 0.06 },

  // ── Amazon — referral fee por categoria ────────────────────────────────────
  { marketplace: 'amazon', categoria: 'Eletrônicos',         classico: 0.08, premium: 0.08 },
  { marketplace: 'amazon', categoria: 'Informática',         classico: 0.08, premium: 0.08 },
  { marketplace: 'amazon', categoria: 'Livros',              classico: 0.15, premium: 0.15 },
  { marketplace: 'amazon', categoria: 'Vestuário e Moda',   classico: 0.17, premium: 0.17 },
  { marketplace: 'amazon', categoria: 'Beleza',              classico: 0.13, premium: 0.13 },
  { marketplace: 'amazon', categoria: 'Brinquedos',          classico: 0.12, premium: 0.12 },
  { marketplace: 'amazon', categoria: 'Casa e Cozinha',      classico: 0.12, premium: 0.12 },
  { marketplace: 'amazon', categoria: 'Ferramentas',         classico: 0.12, premium: 0.12 },
  { marketplace: 'amazon', categoria: 'Outras categorias',   classico: 0.15, premium: 0.15 },

  // ── Magalu — estimativa por categoria ─────────────────────────────────────
  { marketplace: 'magalu', categoria: 'Eletrônicos',         classico: 0.12, premium: 0.12 },
  { marketplace: 'magalu', categoria: 'Eletrodomésticos',    classico: 0.13, premium: 0.13 },
  { marketplace: 'magalu', categoria: 'Informática',         classico: 0.12, premium: 0.12 },
  { marketplace: 'magalu', categoria: 'Moda',                classico: 0.16, premium: 0.16 },
  { marketplace: 'magalu', categoria: 'Casa e Decoração',    classico: 0.14, premium: 0.14 },
  { marketplace: 'magalu', categoria: 'Beleza',              classico: 0.14, premium: 0.14 },
  { marketplace: 'magalu', categoria: 'Outras categorias',   classico: 0.13, premium: 0.13 },

  // ── Americanas — estimativa por categoria ──────────────────────────────────
  { marketplace: 'americanas', categoria: 'Eletrônicos',         classico: 0.13, premium: 0.13 },
  { marketplace: 'americanas', categoria: 'Eletrodomésticos',    classico: 0.14, premium: 0.14 },
  { marketplace: 'americanas', categoria: 'Informática',         classico: 0.13, premium: 0.13 },
  { marketplace: 'americanas', categoria: 'Moda',                classico: 0.17, premium: 0.17 },
  { marketplace: 'americanas', categoria: 'Casa e Decoração',    classico: 0.15, premium: 0.15 },
  { marketplace: 'americanas', categoria: 'Beleza',              classico: 0.15, premium: 0.15 },
  { marketplace: 'americanas', categoria: 'Outras categorias',   classico: 0.14, premium: 0.14 },
]

// ── Persistência das condições ─────────────────────────────────────────────

export function getCondicoes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return DEFAULT_CONDITIONS
}

export function saveCondicoes(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetCondicoes() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(MKT_LABELS_KEY)
  return DEFAULT_CONDITIONS
}

// ── Labels de marketplaces personalizados ──────────────────────────────────

export function getCustomLabels() {
  try {
    const raw = localStorage.getItem(MKT_LABELS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

export function saveCustomLabels(labels) {
  localStorage.setItem(MKT_LABELS_KEY, JSON.stringify(labels))
}

// ── Helpers dinâmicos ──────────────────────────────────────────────────────

/** Retorna o nome de exibição de qualquer marketplace (built-in ou personalizado). */
export function getMarketplaceLabel(key) {
  if (BUILT_IN_LABELS[key]) return BUILT_IN_LABELS[key]
  const custom = getCustomLabels()
  if (custom[key]) return custom[key]
  // Formata a partir da chave: "via_varejo" → "Via Varejo"
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Retorna o emoji do marketplace. */
export function getMarketplaceEmoji(key) {
  return BUILT_IN_EMOJIS[key] || '🏪'
}

/**
 * Retorna lista de todos os marketplaces presentes nas condições,
 * com id, label e emoji — inclui personalizados.
 */
export function getMarketplaces(condicoes) {
  const c = condicoes || getCondicoes()
  const keys = [...new Set(c.map(r => r.marketplace))]
  const customLabels = getCustomLabels()
  return keys.map(key => ({
    id:    key,
    label: BUILT_IN_LABELS[key] || customLabels[key] || getMarketplaceLabel(key),
    emoji: BUILT_IN_EMOJIS[key] || '🏪',
  }))
}

/** Retorna as categorias configuradas para um marketplace específico. */
export function getCategoriasFor(marketplace, condicoes) {
  const c = condicoes || getCondicoes()
  return c
    .filter(r => r.marketplace === marketplace && r.categoria)
    .map(r => r.categoria)
}

/** Mantido por compatibilidade retroativa. */
export function getCategoriasML(condicoes) {
  return getCategoriasFor('mercadolivre', condicoes)
}

// ── Catálogo de produtos salvos ────────────────────────────────────────────

const CATALOG_KEY = 'margem-certa-catalogo'

export function getCatalogo() {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEY)) || [] }
  catch { return [] }
}

export function saveProduto(produto) {
  const catalogo = getCatalogo()
  const id = produto.id || crypto.randomUUID()
  const novo = { ...produto, id, atualizadoEm: new Date().toISOString() }
  const idx = catalogo.findIndex(p => p.id === id)
  if (idx >= 0) catalogo[idx] = novo
  else catalogo.push(novo)
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalogo))
  return novo
}

export function deleteProduto(id) {
  const filtrado = getCatalogo().filter(p => p.id !== id)
  localStorage.setItem(CATALOG_KEY, JSON.stringify(filtrado))
}
