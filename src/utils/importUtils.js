import * as XLSX from 'xlsx'

const MARKETPLACES_VALIDOS = ['mercadolivre', 'shopee', 'amazon']

const COLUNAS_OBRIGATORIAS = [
  'nome_produto',
  'custo_produto',
  'marketplace',
  'ads',
  'imposto',
  'devolucao',
  'margem_alvo',
]

const TEMPLATE_HEADER = [
  'sku',
  'nome_produto',
  'custo_produto',
  'frete_absorvido',
  'outros_custos',
  'marketplace',
  'categoria',
  'ads',
  'imposto',
  'devolucao',
  'margem_alvo',
]

export function generateTemplate() {
  const exemplo = [
    'CAM-001,Camiseta Básica,35.00,8.00,2.50,mercadolivre,Moda e Acessórios,8,6,1,15',
    'FON-002,Fone de Ouvido,89.90,0,3.00,mercadolivre,Eletrônicos; Áudio e Vídeo,10,6,2,20',
    'KIT-003,Kit Maquiagem,45.00,5.00,4.00,shopee,,5,6,1,18',
  ]
  return TEMPLATE_HEADER.join(',') + '\n' + exemplo.join('\n')
}

function normNum(raw) {
  if (raw === undefined || raw === null || raw === '') return 0
  const s = String(raw).replace('%', '').replace(',', '.').trim()
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

function normalizeRow(obj) {
  return {
    sku:              String(obj.sku || '').trim(),
    nome_produto:     String(obj.nome_produto || '').trim(),
    custo_produto:    normNum(obj.custo_produto),
    frete_absorvido:  normNum(obj.frete_absorvido),
    outros_custos:    normNum(obj.outros_custos),
    marketplace:      String(obj.marketplace || '').toLowerCase().trim(),
    categoria:        String(obj.categoria || '').trim() || null,
    ads:              normNum(obj.ads),
    imposto:          normNum(obj.imposto),
    devolucao:        normNum(obj.devolucao),
    margem_alvo:      normNum(obj.margem_alvo),
  }
}

function validateRow(row, lineNum) {
  const errors = []
  if (!row.nome_produto) errors.push(`Linha ${lineNum}: nome_produto é obrigatório`)
  if (!row.marketplace) errors.push(`Linha ${lineNum}: marketplace é obrigatório`)
  if (row.marketplace && !MARKETPLACES_VALIDOS.includes(row.marketplace)) {
    errors.push(`Linha ${lineNum}: marketplace inválido "${row.marketplace}". Use: ${MARKETPLACES_VALIDOS.join(', ')}`)
  }
  if (row.custo_produto <= 0) errors.push(`Linha ${lineNum}: custo_produto deve ser maior que zero`)
  return errors
}

function sheetToObjects(ws) {
  return XLSX.utils.sheet_to_json(ws, { defval: '' })
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv' || ext === 'txt') {
    const text = await file.text()
    return parseCSVText(text)
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw = sheetToObjects(ws)
    return processRows(raw)
  }

  throw new Error(`Formato não suportado: .${ext}. Use .csv, .xlsx, .xls ou .txt`)
}

function detectDelimiter(firstLine) {
  const counts = { ',': 0, ';': 0, '\t': 0, '|': 0 }
  for (const ch of firstLine) if (ch in counts) counts[ch]++
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) throw new Error('Arquivo vazio ou sem dados além do cabeçalho.')

  const delimiter = detectDelimiter(lines[0])
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/ /g, '_'))

  const raw = lines.slice(1).map(line => {
    const vals = line.split(delimiter)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i]?.trim() || '' })
    return obj
  })

  return processRows(raw)
}

function processRows(raw) {
  const valid = []
  const errors = []

  raw.forEach((obj, i) => {
    const lineNum = i + 2
    const row = normalizeRow(obj)
    const rowErrors = validateRow(row, lineNum)
    if (rowErrors.length) {
      errors.push(...rowErrors)
    } else {
      valid.push(row)
    }
  })

  return { valid, errors, total: raw.length }
}
