# MargemCerta — Plano de Melhorias para Claude Code

## Contexto do Projeto

**Projeto:** MargemCerta — calculadora de precificação para sellers de marketplaces brasileiros  
**Stack:** React + Vite + Tailwind CSS, sem backend (localStorage/sessionStorage)  
**Deploy:** Vercel  
**Estrutura relevante:**
```
src/
  components/
    CondicoesTable.jsx      ← taxas por marketplace/categoria (já atualizado)
    CostInputs.jsx          ← inputs de custo do produto
    MarketplaceSelector.jsx ← seletor de marketplace (já atualizado)
    ResultCards.jsx         ← cards de resultado clássico/premium
    ScenarioSimulator.jsx   ← simulador de cenários de preço
    VariableSliders.jsx     ← sliders de ads/imposto/devolução/margem
    VolumeProjection.jsx    ← projeção de lucro por volume
  pages/
    Landing.jsx             ← calculadora individual (página principal)
    Importar.jsx            ← importação em massa CSV/XLSX
    Resultados.jsx          ← resultados da importação em massa
    Configuracoes.jsx       ← configuração de taxas
  utils/
    importUtils.js          ← parsing de arquivos
    pricingLogic.js         ← lógica de cálculo de preço e margem
    storageUtils.js         ← persistência no localStorage (já atualizado)
```

---

## FASE 1 — Simulador de Frete (PRIORIDADE MÁXIMA)

### Por que é importante

O frete é um dos maiores custos invisíveis para sellers. No Mercado Livre as regras são complexas:

- Listagens **Premium** com preço acima de R$79 **obrigam o seller a absorver o frete** — se ele não incluir esse custo na precificação, perde margem sem perceber
- O custo real cobrado pelas transportadoras é o **peso tarifável**, que é o maior entre o peso real e o peso cubado (volumétrico) — um erro comum que faz o seller subestimar o custo
- Existem quatro modalidades com custos muito diferentes: ML Flex, Correios PAC, Correios SEDEX e ML Full

---

### Conceito fundamental: Peso Real × Peso Cubado

**Este conceito DEVE ser explicado ao usuário dentro do componente**, pois é a principal fonte de erro de sellers iniciantes.

**O que é peso cubado:**
Transportadoras não cobram só pelo peso físico. Se a embalagem ocupa muito espaço no caminhão mesmo sendo leve, elas cobram pelo volume ocupado. A fórmula é:

```
Peso Cubado (kg) = Comprimento(cm) × Largura(cm) × Altura(cm) ÷ 6.000
```

**O que é peso tarifável:**
```
Peso Tarifável = MAX(Peso Real, Peso Cubado)
```

**Exemplo para o usuário ver no app:**
> "Sua almofada pesa 0,4 kg, mas a embalagem mede 40×35×20 cm.  
> Peso cubado = 40×35×20÷6000 = **4,67 kg**  
> Você paga o frete como se o produto pesasse 4,67 kg — não 0,4 kg."

**Quando o peso cubado não se aplica:**
- ML Full: usa categorias de tamanho (Pequeno/Médio/Grande), não peso linear
- Seller que não informa dimensões: calcular apenas pelo peso real, com aviso de que o valor pode estar subestimado

---

### Regras de Absorção de Frete — Mercado Livre

O componente deve detectar automaticamente a situação e orientar o seller. Implementar esta lógica:

| Situação | Regra | O que mostrar |
|---|---|---|
| Listagem **Premium** + preço ≥ R$79 | Frete grátis **obrigatório** | 🔴 Alerta: "Frete obrigatoriamente absorvido por você neste caso" |
| Listagem **Premium** + preço < R$79 | Frete grátis opcional | 🟡 Aviso: "Abaixo de R$79 o frete grátis é opcional no Premium" |
| Listagem **Clássica** | Seller decide | 🔵 Info: "No Clássico você pode repassar o frete ao comprador" |
| Modalidade **ML Full** | Custo de fulfillment sempre absorvido | 🔴 Alerta: "No ML Full o custo por unidade é sempre seu" |

A lógica deve cruzar com o preço ideal calculado na calculadora (disponível como prop) para mostrar o alerta correto em tempo real.

---

### Campos do Simulador — O que pedir e por quê

Implementar dois modos de entrada para o usuário:

#### MODO SIMPLES (padrão ao abrir o componente)
Apenas peso e modalidade. Rápido para quem já conhece o produto.

| Campo | Tipo | Obrigatório | Placeholder | Dica contextual |
|---|---|---|---|---|
| Peso real (kg) | número decimal | Sim | `ex: 0,5` | "Peso do produto com embalagem" |
| Modalidade de envio | select | Sim | — | Ver opções abaixo |

#### MODO COMPLETO (expandível com link "Calcular com dimensões")
Adiciona os campos de embalagem para calcular o peso cubado.

| Campo | Tipo | Obrigatório | Placeholder | Dica contextual |
|---|---|---|---|---|
| Peso real (kg) | número decimal | Sim | `ex: 0,5` | "Peso do produto com embalagem" |
| Comprimento (cm) | número inteiro | Não | `ex: 30` | "Lado maior da caixa" |
| Largura (cm) | número inteiro | Não | `ex: 20` | "Lado do meio da caixa" |
| Altura (cm) | número inteiro | Não | `ex: 10` | "Lado menor / espessura" |
| Modalidade de envio | select | Sim | — | Ver opções abaixo |

**Quando o usuário informa as dimensões**, mostrar abaixo dos campos:
```
Peso real: 0,5 kg
Peso cubado: 1,0 kg   ← calculado em tempo real
Peso tarifável: 1,0 kg  ← o que será cobrado (em destaque)
```
Se peso cubado > peso real, realçar em laranja com explicação breve.

---

### Opções de Modalidade de Envio

Cada opção deve ter uma descrição curta que aparece como subtexto no select ou como tooltip:

```
[ Selecione a modalidade ▾ ]
  ├─ ML Flex            → "Entrega feita por você ou motoboy parceiro. Ideal para SP capital."
  ├─ Correios PAC       → "Entrega padrão pelos Correios. Prazo 5–10 dias úteis."
  ├─ Correios SEDEX     → "Entrega expressa pelos Correios. Prazo 1–3 dias úteis."
  ├─ ML Full            → "Armazenamento no galpão do ML. Custo por unidade enviada."
  └─ Informar manualmente → "Você já sabe o custo. Digite diretamente."
```

Quando o usuário selecionar **"Informar manualmente"**, ocultar os campos de peso/dimensão e mostrar apenas:

```
Custo do frete (R$): [_______]
[ Usar este valor → ]
```

---

### Tabelas de Estimativa de Frete

Criar em `src/utils/freteUtils.js`:

```js
// ── Tabela ML Flex (estimativa por faixa de peso) ──────────────────────────
// Referência: valores praticados via transportadoras parceiras ML, 2025
export const ML_FLEX_TABLE = [
  { pesoMax: 0.3,  custo: 6.50  },
  { pesoMax: 0.5,  custo: 7.50  },
  { pesoMax: 1.0,  custo: 9.00  },
  { pesoMax: 2.0,  custo: 11.00 },
  { pesoMax: 5.0,  custo: 15.00 },
  { pesoMax: 10.0, custo: 22.00 },
  { pesoMax: 30.0, custo: 35.00 },
]

// ── Tabela Correios PAC via ML (tarifas subsidiadas) ──────────────────────
export const CORREIOS_PAC_TABLE = [
  { pesoMax: 0.3,  custo: 8.00  },
  { pesoMax: 0.5,  custo: 9.50  },
  { pesoMax: 1.0,  custo: 12.00 },
  { pesoMax: 2.0,  custo: 15.00 },
  { pesoMax: 5.0,  custo: 20.00 },
  { pesoMax: 10.0, custo: 28.00 },
  { pesoMax: 30.0, custo: 45.00 },
]

// ── Tabela Correios SEDEX via ML ───────────────────────────────────────────
export const CORREIOS_SEDEX_TABLE = [
  { pesoMax: 0.3,  custo: 15.00 },
  { pesoMax: 0.5,  custo: 18.00 },
  { pesoMax: 1.0,  custo: 22.00 },
  { pesoMax: 2.0,  custo: 28.00 },
  { pesoMax: 5.0,  custo: 38.00 },
  { pesoMax: 10.0, custo: 55.00 },
  { pesoMax: 30.0, custo: 85.00 },
]

// ── Tabela ML Full (por categoria de tamanho) ─────────────────────────────
// ML Full não usa peso linear — usa categoria de tamanho da embalagem
export const ML_FULL_CATEGORIAS = [
  {
    id: 'pequeno',
    nome: 'Pequeno',
    descricao: 'Até 300g | Embalagem até 20×15×5 cm',
    pesoMax: 0.3,
    dimMax: { c: 20, l: 15, a: 5 },
    custo: 7.00,
  },
  {
    id: 'medio',
    nome: 'Médio',
    descricao: 'Até 2 kg | Embalagem até 40×30×20 cm',
    pesoMax: 2.0,
    dimMax: { c: 40, l: 30, a: 20 },
    custo: 10.50,
  },
  {
    id: 'grande',
    nome: 'Grande',
    descricao: 'Até 5 kg | Embalagem até 60×45×30 cm',
    pesoMax: 5.0,
    dimMax: { c: 60, l: 45, a: 30 },
    custo: 16.00,
  },
  {
    id: 'extra_grande',
    nome: 'Extra Grande',
    descricao: 'Até 30 kg | Acima de 60×45×30 cm',
    pesoMax: 30.0,
    dimMax: null,
    custo: 28.00,
  },
]

// Peso cubado: fórmula padrão transportadoras
export function calcPesoCubado(c, l, a) {
  if (!c || !l || !a) return 0
  return (c * l * a) / 6000
}

// Peso tarifável: maior entre real e cubado
export function calcPesoTarifavel(pesoReal, c, l, a) {
  const cubado = calcPesoCubado(c, l, a)
  return cubado > 0 ? Math.max(pesoReal, cubado) : pesoReal
}

// Categoria ML Full a partir de peso e dimensões
export function getCategoriaMlFull(pesoReal, c, l, a) {
  // Verifica por dimensões se informadas
  if (c && l && a) {
    return ML_FULL_CATEGORIAS.find(cat =>
      cat.dimMax &&
      c <= cat.dimMax.c &&
      l <= cat.dimMax.l &&
      a <= cat.dimMax.a &&
      pesoReal <= cat.pesoMax
    ) || ML_FULL_CATEGORIAS[ML_FULL_CATEGORIAS.length - 1]
  }
  // Fallback por peso
  return ML_FULL_CATEGORIAS.find(cat => pesoReal <= cat.pesoMax) ||
         ML_FULL_CATEGORIAS[ML_FULL_CATEGORIAS.length - 1]
}

function buscaTabela(tabela, peso) {
  return (tabela.find(f => peso <= f.pesoMax) || tabela[tabela.length - 1]).custo
}

// Função principal de estimativa
export function calcularEstimativaFrete({ peso, comprimento, largura, altura, modalidade }) {
  const pesoReal = Number(peso) || 0
  const c = Number(comprimento) || 0
  const l = Number(largura) || 0
  const a = Number(altura) || 0
  if (pesoReal <= 0) return null

  const pesoCubado = calcPesoCubado(c, l, a)
  const pesoTarifavel = pesoCubado > 0 ? Math.max(pesoReal, pesoCubado) : pesoReal
  const usouCubado = pesoCubado > pesoReal

  switch (modalidade) {
    case 'ml_flex':
      return {
        custo: buscaTabela(ML_FLEX_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa para ML Flex. O valor varia por rota e transportadora parceira.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'correios_pac':
      return {
        custo: buscaTabela(CORREIOS_PAC_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa PAC via ML (tarifas subsidiadas). Confirme os valores na sua conta ML.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'correios_sedex':
      return {
        custo: buscaTabela(CORREIOS_SEDEX_TABLE, pesoTarifavel),
        pesoReal, pesoCubado, pesoTarifavel, usouCubado,
        aviso: 'Estimativa SEDEX via ML. O valor varia por origem e destino.',
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242',
      }
    case 'ml_full': {
      const cat = getCategoriaMlFull(pesoReal, c, l, a)
      return {
        custo: cat.custo,
        pesoReal, pesoCubado: 0, pesoTarifavel: pesoReal, usouCubado: false,
        categoriaFull: cat,
        aviso: `Produto na categoria "${cat.nome}" do ML Full. Custo por unidade enviada. Não inclui mensalidade de armazenagem.`,
        linkOficial: 'https://www.mercadolivre.com.br/ajuda/sobre-mercado-envios-full_1505',
      }
    }
    default:
      return null
  }
}

// Verifica obrigatoriedade de frete grátis no ML Premium
export const ML_LIMIAR_FRETE_GRATIS = 79.00

export function getStatusAbsorcaoFrete({ marketplace, tipoListagem, precoIdeal }) {
  if (marketplace !== 'mercadolivre') {
    return {
      tipo: 'info',
      mensagem: 'Verifique a política de frete deste marketplace.',
    }
  }
  if (tipoListagem === 'ml_full') {
    return {
      tipo: 'obrigatorio',
      mensagem: 'No ML Full o custo de fulfillment é sempre absorvido por você por unidade enviada.',
    }
  }
  if (tipoListagem === 'premium' && precoIdeal >= ML_LIMIAR_FRETE_GRATIS) {
    return {
      tipo: 'obrigatorio',
      mensagem: `Seu preço (R$${precoIdeal?.toFixed(2)}) está acima de R$79. No Anúncio Premium o frete grátis é obrigatório — você absorve este custo.`,
    }
  }
  if (tipoListagem === 'premium' && precoIdeal < ML_LIMIAR_FRETE_GRATIS) {
    return {
      tipo: 'atencao',
      mensagem: `Seu preço está abaixo de R$79. O frete grátis é opcional no Premium neste caso, mas oferecê-lo pode aumentar suas conversões.`,
    }
  }
  if (tipoListagem === 'classico') {
    return {
      tipo: 'opcional',
      mensagem: 'No Anúncio Clássico você decide se absorve o frete ou repassa ao comprador.',
    }
  }
  return null
}
```

---

### Componente `src/components/SimuladorFrete.jsx`

#### Props do componente

```jsx
<SimuladorFrete
  marketplace={marketplace}           // string: 'mercadolivre' | 'shopee' | etc.
  precoIdealClassico={number|null}    // preço calculado para listagem clássica
  precoIdealPremium={number|null}     // preço calculado para listagem premium
  onAplicarFrete={(valor) => void}    // callback: preenche campo freteAbsorvido
/>
```

#### Estrutura visual completa do componente

O componente deve ser organizado em 3 blocos visuais:

---

**BLOCO A — Cabeçalho com explicação inicial (sempre visível)**

```
📦 Simulador de Frete

Descubra quanto você pagará de frete e se deve incluir esse custo no preço.

ℹ️ [O que é peso cubado?] ← link/botão que expande um texto explicativo
```

Texto do tooltip "O que é peso cubado?":
> "Transportadoras cobram pelo maior valor entre o peso real e o peso volumétrico (cubado). Um produto leve mas volumoso pode ser cobrado como se pesasse muito mais.
> **Fórmula:** Comprimento × Largura × Altura ÷ 6.000
> **Exemplo:** Caixa de 40×30×20 cm = 4 kg de peso cubado, independente do peso real."

---

**BLOCO B — Formulário de entrada**

Sempre mostrar:
```
Modalidade de envio *
[ ML Flex ▾ ]

Peso da embalagem (kg) *
[_______]  ex: 0,500
```

Link expansível abaixo do peso:
```
▸ Incluir dimensões para calcular peso cubado (recomendado)
```

Quando expandido, mostrar:
```
Comprimento (cm)   Largura (cm)   Altura (cm)
[_______]          [_______]      [_______]
ex: 30             ex: 20         ex: 10

Dica: Meça a embalagem fechada, não o produto solto.
```

Se modalidade = **"Informar manualmente"**, ocultar todos os campos acima e mostrar:
```
Custo do frete que você paga (R$)
[_______]
```

---

**BLOCO C — Resultado e ação (aparece após preencher campos obrigatórios)**

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTIMATIVA DE FRETE                       │
│                                                             │
│  Peso real:      0,400 kg                                   │
│  Peso cubado:    4,667 kg  ⚠ maior que o peso real!        │
│  Peso tarifável: 4,667 kg  ← este é o que será cobrado     │
│                                                             │
│  Custo estimado:  R$ 15,00 (ML Flex)                        │
│                                                             │
│  ⚠ Estimativa. Varia por rota e transportadora.            │
│  → Ver tabela oficial                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  QUEM PAGA O FRETE?                                         │
│                                                             │
│  🔴 Seu preço estimado (R$72,00) fica acima de R$79        │
│     no Anúncio Premium.                                     │
│     O frete grátis é OBRIGATÓRIO — você absorve             │
│     este custo no preço de venda.                           │
└─────────────────────────────────────────────────────────────┘

[ ✓ Usar R$ 15,00 como Frete Absorvido na calculadora ]
```

Cores dos alertas de absorção:
- `obrigatorio` → fundo vermelho claro, texto vermelho, ícone 🔴
- `atencao` → fundo amarelo claro, texto âmbar, ícone 🟡
- `opcional` → fundo azul claro, texto azul, ícone 🔵
- `info` → fundo cinza claro, texto cinza, ícone ℹ️

---

#### Instruções de uso embutidas no componente (textos finais)

Estes textos devem aparecer como guia para o usuário final da ferramenta:

**Instrução geral (no topo do componente, discreta):**
> "Use este simulador para estimar quanto você pagará de frete por produto vendido e incluir esse valor corretamente no seu preço de venda."

**Instrução por modalidade (aparece ao selecionar):**

| Modalidade | Texto de instrução |
|---|---|
| ML Flex | "Ideal para quem entrega com motoboy ou carro próprio. Disponível principalmente em grandes centros. O custo varia pela rota — este é um valor de referência." |
| Correios PAC | "A modalidade mais comum para envios nacionais. O ML negocia tarifas menores que o balcão dos Correios. Confirme o valor exato no painel do ML." |
| Correios SEDEX | "Entrega expressa, mais cara. Use quando a velocidade de entrega for um diferencial do seu produto." |
| ML Full | "Você envia seus produtos em lote para o galpão do ML. Eles empacotam e entregam para o cliente. O custo é por unidade enviada ao cliente final, mais uma mensalidade de armazenagem (não incluída aqui)." |
| Informar manualmente | "Se você já tem o valor exato do frete (da sua conta ML, transportadora ou cotação), use este campo." |

**Instrução sobre o botão "Usar este valor":**
> "Ao clicar, o valor será preenchido automaticamente no campo 'Frete Absorvido' da calculadora acima e o preço ideal será recalculado."

**Nota de rodapé do componente (sempre visível):**
> "⚠️ Os valores são estimativas baseadas em tabelas de referência. As tarifas variam por rota, peso, dimensão e contratos específicos de cada seller com o ML. Consulte sempre o painel oficial antes de tomar decisões de precificação."  
> [Ver tabela oficial do Mercado Livre →]

---

### Integração na `Landing.jsx`

Inserir o `SimuladorFrete` entre o Passo 2 (CostInputs) e o Passo 3 (VariableSliders):

```jsx
import SimuladorFrete from '../components/SimuladorFrete'

// No JSX, após o card de CostInputs:
{marketplace === 'mercadolivre' || true /* mostrar para todos */ ? (
  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
    <SimuladorFrete
      marketplace={marketplace}
      precoIdealClassico={resultados?.classico?.precoIdeal ?? null}
      precoIdealPremium={resultados?.premium?.precoIdeal ?? null}
      onAplicarFrete={(valor) =>
        setCosts(c => ({ ...c, freteAbsorvido: valor }))
      }
    />
  </div>
) : null}
```

Numerar este passo como **Passo 2B** na UI (entre CostInputs e VariableSliders), com indicador visual opcional.

---

### Integração no template de importação (`importUtils.js`)

O campo `frete_absorvido` já existe no CSV. Melhorar a documentação do template:

```js
// Coluna frete_absorvido no template — atualizar comentário/exemplo:
// frete_absorvido: valor em R$ do frete que o seller absorve por unidade.
// Use o Simulador de Frete em margem-certa para estimar este valor.
// Exemplo: 9.00 (para ML Flex, produto de 1kg)
// Deixe 0 se o frete é pago pelo comprador.
```

---

## FASE 2 — Regime Tributário

### Por que é importante

MEI paga ~5%, Simples Nacional varia de 4% a 19% dependendo do faturamento e atividade, Lucro Presumido tem carga aproximada de 11,33%. Hoje o campo "Imposto" é livre — uma seleção de regime já pré-preenche o percentual correto e educa o seller.

### Instruções de uso para o cliente (embutir no componente)

Adicionar no topo do seletor de regime:

> "Selecione seu regime tributário para preencher automaticamente o percentual de imposto estimado. Se não souber o seu regime, consulte o contador ou o portal do Simples Nacional."

Tooltip no campo de imposto quando regime selecionado:
> "Valor pré-preenchido com base no seu regime. Você pode ajustar manualmente se tiver um percentual diferente."

### O que criar

#### 2.1 — `src/utils/tributarioUtils.js` (novo)

```js
export const REGIMES = [
  {
    id: 'manual',
    label: 'Informar manualmente',
    descricao: 'Você define o percentual de imposto.',
    aliquota: null,
    bloqueiaSlider: false,
  },
  {
    id: 'mei',
    label: 'MEI — Microempreendedor Individual',
    descricao: 'DAS mensal fixo. Para efeito de precificação, use ~5% como referência.',
    aliquota: 5.0,
    bloqueiaSlider: false,
    aviso: 'MEI paga um DAS fixo mensal, não um percentual por venda. Este valor (5%) é uma referência para cobrir o custo do DAS no preço.',
  },
  {
    id: 'simples_faixa1',
    label: 'Simples Nacional — Faixa 1 (até R$180k/ano)',
    descricao: 'Alíquota efetiva aproximada de 4% a 6% para comércio.',
    aliquota: 5.0,
    bloqueiaSlider: true,
  },
  {
    id: 'simples_faixa2',
    label: 'Simples Nacional — Faixa 2 (até R$360k/ano)',
    descricao: 'Alíquota efetiva aproximada de 7% a 9%.',
    aliquota: 8.0,
    bloqueiaSlider: true,
  },
  {
    id: 'simples_faixa3',
    label: 'Simples Nacional — Faixa 3 (até R$720k/ano)',
    descricao: 'Alíquota efetiva aproximada de 9% a 11%.',
    aliquota: 10.0,
    bloqueiaSlider: true,
  },
  {
    id: 'simples_faixa4',
    label: 'Simples Nacional — Faixa 4 (até R$1,8M/ano)',
    descricao: 'Alíquota efetiva aproximada de 11% a 14%.',
    aliquota: 12.5,
    bloqueiaSlider: true,
  },
  {
    id: 'lucro_presumido',
    label: 'Lucro Presumido',
    descricao: 'Carga aproximada de 11,33% para comércio (PIS + COFINS + IRPJ + CSLL).',
    aliquota: 11.33,
    bloqueiaSlider: true,
  },
  {
    id: 'lucro_real',
    label: 'Lucro Real',
    descricao: 'Alíquota variável. Informe o percentual manualmente após selecionar.',
    aliquota: null,
    bloqueiaSlider: false,
    aviso: 'No Lucro Real a alíquota depende do resultado da empresa. Consulte seu contador.',
  },
]
```

#### 2.2 — Atualizar `VariableSliders.jsx`

Adicionar `<select>` de regime tributário acima do slider de imposto. Quando regime com `bloqueiaSlider: true` é selecionado, o slider fica readonly e exibe o valor pré-preenchido. Quando `aviso` existe, mostrar um banner amarelo abaixo do select.

---

## FASE 3 — Comparativo entre Marketplaces

### Por que é importante

O seller que vende em múltiplos canais precisa saber onde o produto dá mais margem para priorizar estoque, campanhas de ads e promoções.

### Instruções de uso para o cliente (embutir no componente)

```
ℹ️ Este comparativo usa os mesmos custos que você preencheu acima
e recalcula o preço ideal e a margem para cada marketplace que
você configurou em Condições Comerciais.
```

### O que criar

#### 3.1 — `src/components/ComparativoMarketplaces.jsx` (novo)

**Props:**
```jsx
<ComparativoMarketplaces costs={costs} sliders={sliders} condicoes={condicoes} />
```

**Interface:**
```
┌────────────────────┬───────────┬──────────┬──────────┬────────┐
│ Marketplace        │ Categoria │ Preço    │ Margem   │ Lucro  │
├────────────────────┼───────────┼──────────┼──────────┼────────┤
│ 🟠 Shopee          │ Moda      │ R$67,00  │ 18,5% ★  │ R$12,4 │  ← melhor
│ 🛒 Mercado Livre   │ Moda      │ R$72,00  │ 15,2%    │ R$10,9 │
│ 📦 Amazon          │ Moda      │ R$73,50  │ 14,8%    │ R$10,9 │
│ 🛍️ Magalu          │ Moda      │ R$74,00  │ 14,1%    │ R$10,4 │
└────────────────────┴───────────┴──────────┴──────────┴────────┘

★ = melhor opção por margem
```

A lógica usa `getMarketplaces(condicoes)` para obter todos os marketplaces configurados, depois chama `calcularPrecificacao()` para cada um e ordena pela melhor margem.

---

## FASE 4 — Catálogo de Produtos Salvo

### Instruções de uso para o cliente

Na página de Catálogo, adicionar banner de boas-vindas na primeira visita:

> "Salve seus produtos aqui para não precisar redigitar os dados toda vez. Quando os custos mudarem (fornecedor, embalagem, frete), recalcule todos de uma vez."

### O que criar

#### 4.1 — Funções em `storageUtils.js` (adicionar, não modificar existentes)

```js
const CATALOG_KEY = 'margem-certa-catalogo'

export function getCatalogo() {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEY)) || [] }
  catch { return [] }
}

export function saveProduto(produto) {
  // produto = { id, nome, marketplace, categoria, costs, sliders, criadoEm }
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
```

#### 4.2 — `src/pages/Catalogo.jsx` (nova)

Lista de produtos salvos. Cada produto exibe: nome, marketplace, categoria, preço ideal e margem calculados na hora (chamando `calcularPrecificacao()` com os dados salvos). Botões: Calcular (carrega na Landing via query params), Editar, Excluir.

#### 4.3 — Botão "Salvar produto" na `Landing.jsx`

Ao lado do `ExportButton`, abrir um modal simples com campo "Nome do produto" e botão Salvar.

#### 4.4 — `App.jsx` e `Navbar.jsx`

Adicionar rota `/catalogo` e link no menu.

---

## FASE 5 — Dashboard de Visão Geral

### Instruções de uso para o cliente

Banner no topo do Dashboard:
> "Aqui você vê um resumo de todos os produtos salvos no seu catálogo. Produtos críticos são aqueles com margem abaixo de 5%."

### O que criar

#### 5.1 — `src/pages/Dashboard.jsx` (nova)

Cards de resumo + gráfico de barras simples em CSS/Tailwind (sem biblioteca externa) mostrando distribuição de margens por marketplace.

---

## Instruções Gerais para o Claude Code

### Ordem de execução recomendada

```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5
```

Cada fase é independente e pode ser entregue e testada separadamente.

### Regras a seguir

1. **Não instalar dependências novas** — manter apenas React, React Router e Tailwind
2. **Tailwind apenas** — não criar arquivos CSS separados
3. **Sem backend** — persistência via `localStorage` e `sessionStorage`
4. **Componentes isolados** — cada funcionalidade em componente separado
5. **Compatibilidade** — manter `getCategoriasML()` em `storageUtils.js`
6. **Avisos obrigatórios** — todo valor de estimativa (frete, taxa) deve ter aviso visual com link para fonte oficial
7. **Responsivo** — testar em mobile. Usar `flex-wrap`, `grid-cols-1 sm:grid-cols-2`
8. **Formato monetário** — sempre usar `formatBRL()` de `pricingLogic.js`
9. **Instruções ao usuário** — todo componente novo deve ter textos de orientação embutidos, conforme especificado em cada fase

### Arquivos que não devem ser modificados nesta fase

- `pricingLogic.js` — lógica central estável
- `Configuracoes.jsx` — já atualizado
- `CondicoesTable.jsx` — já atualizado
- `MarketplaceSelector.jsx` — já atualizado
- `storageUtils.js` — apenas adicionar funções novas, não modificar as existentes

### Como testar cada fase

```bash
npm run dev
```

**Fase 1 — Frete:**
- Acessar `/` → localizar "Simulador de Frete" entre Custos e Variáveis
- Testar modo simples: peso 0,5 kg + ML Flex → verificar estimativa
- Testar com dimensões: 40×30×20 cm + 0,4 kg → peso cubado deve ser 4,0 kg e tarifável 4,0 kg
- Verificar aviso de absorção obrigatória quando preço Premium ≥ R$79
- Clicar "Usar este valor" → verificar que campo "Frete Absorvido" é preenchido e resultado recalcula
- Testar modalidade "Informar manualmente" → apenas campo de valor deve aparecer
- Testar ML Full: 0,3 kg → deve mostrar categoria "Pequeno" + custo R$7,00

**Fase 2 — Regime Tributário:**
- Selecionar "Simples Nacional Faixa 1" → slider de imposto vai para 5% e fica bloqueado
- Selecionar "MEI" → slider vai para 5% mas fica editável + aviso amarelo aparece
- Selecionar "Informar manualmente" → slider fica editável normalmente

**Fase 3 — Comparativo:**
- Preencher calculadora → tabela comparativa deve aparecer abaixo dos ResultCards
- Verificar que todos os marketplaces configurados em Condições Comerciais aparecem
- Verificar destaque no marketplace com melhor margem

**Fase 4 — Catálogo:**
- Na calculadora: clicar "Salvar produto" → modal → nomear → salvar
- Acessar `/catalogo` → produto deve aparecer com preço e margem calculados
- Clicar "Calcular" → calculadora deve abrir com os dados desse produto
- Clicar "Excluir" → produto some da lista

**Fase 5 — Dashboard:**
- Salvar pelo menos 3 produtos no catálogo primeiro
- Acessar `/dashboard` → cards de resumo e distribuição por marketplace devem aparecer

---

## Referências Oficiais

- Tarifas de venda ML: https://www.mercadolivre.com.br/landing/custos-de-venda/tarifas-de-venda
- Custos de envio ML: https://www.mercadolivre.com.br/ajuda/custo-de-envio-para-vendedores_1242
- Frete grátis obrigatório ML: https://www.mercadolivre.com.br/ajuda/frete-gratis-mercado-livre_2857
- ML Full (Fulfillment): https://www.mercadolivre.com.br/ajuda/sobre-mercado-envios-full_1505
- Simples Nacional — tabelas: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/calculo-e-pagamento
- Peso cubado (fórmula padrão): Comprimento × Largura × Altura (cm) ÷ 6.000

> ⚠️ **Nota importante para o Claude Code:** Todos os valores de frete são estimativas de referência. O Mercado Livre atualiza tarifas periodicamente e aplica variações por rota, categoria e contrato do seller. Os textos de aviso ao usuário final devem sempre reforçar que os valores precisam ser confirmados no painel oficial do ML antes de serem usados na precificação real.
