const STORAGE_KEY = 'margem-certa-condicoes'

export const DEFAULT_CONDITIONS = [
  // Mercado Livre — por categoria
  { marketplace: 'mercadolivre', categoria: 'Eletrônicos, Áudio e Vídeo', classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Informática', classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Telefonia e Celulares', classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Eletrodomésticos', classico: 0.13, premium: 0.18 },
  { marketplace: 'mercadolivre', categoria: 'Moda e Acessórios', classico: 0.16, premium: 0.21 },
  { marketplace: 'mercadolivre', categoria: 'Calçados', classico: 0.16, premium: 0.21 },
  { marketplace: 'mercadolivre', categoria: 'Beleza e Cuidado Pessoal', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Casa, Móveis e Decoração', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Esportes e Fitness', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Brinquedos e Hobbies', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Saúde', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Alimentos e Bebidas', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Bebês', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Animais', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Ferramentas e Construção', classico: 0.14, premium: 0.19 },
  { marketplace: 'mercadolivre', categoria: 'Veículos e Motores', classico: 0.12, premium: 0.17 },
  { marketplace: 'mercadolivre', categoria: 'Autopeças', classico: 0.12, premium: 0.17 },
  { marketplace: 'mercadolivre', categoria: 'Outras categorias', classico: 0.13, premium: 0.18 },
  // Outros marketplaces — sem categoria
  { marketplace: 'shopee',      categoria: null, classico: 0.12, premium: 0.12 },
  { marketplace: 'amazon',      categoria: null, classico: 0.13, premium: 0.15 },
  { marketplace: 'magalu',      categoria: null, classico: 0.13, premium: 0.16 },
  { marketplace: 'americanas',  categoria: null, classico: 0.14, premium: 0.17 },
]

export function getCondicoes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return DEFAULT_CONDITIONS
}

export function saveCondicoes(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetCondicoes() {
  localStorage.removeItem(STORAGE_KEY)
  return DEFAULT_CONDITIONS
}

export function getCategoriasML(condicoes) {
  const c = condicoes || getCondicoes()
  return c
    .filter(r => r.marketplace === 'mercadolivre' && r.categoria)
    .map(r => r.categoria)
}
