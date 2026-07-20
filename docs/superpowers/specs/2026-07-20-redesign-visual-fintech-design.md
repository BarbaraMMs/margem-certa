# Redesign visual — Fintech Ink & Brass

## Contexto

O MargemCerta já tem uma identidade própria ("Tinta & Latão": ink navy + brass/gold, Fraunces + Manrope, canvas quente) estabelecida nos commits anteriores (hero e logos de marketplace já redesenhados). O pedido desta rodada é levar essa identidade adiante em todo o app, saindo do "modelo padrão" de SaaS genérico, com uma energia mais "fintech moderno" (cartões arredondados, números grandes e confiantes) sem copiar a paleta de nenhum concorrente (Nubank, etc.) e sem cair nos defaults visuais comuns de design gerado por IA (cream+terracota, ou preto+verde-ácido).

Escopo: o app inteiro (calculadora, resultados, comparativo, dashboard, catálogo, menu lateral). Páginas mais utilitárias (Configurações, Admin, Importar) recebem os tokens base, mas não o elemento-assinatura.

## Tokens de design

### Cor

Nenhuma cor nova de marca — reaproveita exatamente o que já existe em `src/index.css` (`--color-ink-*`, `--color-brass-*`, `--color-canvas`, `--color-profit`). A mudança é de **aplicação**: blocos de destaque (hero, cards de resultado, menu lateral) passam a usar ink como fundo sólido, não só como texto/detalhe sobre fundo claro.

Paletas alternativas exploradas e descartadas: roxo estilo Nubank (não distintivo), verde esmeralda (colide semanticamente com `--color-profit`, que já sinaliza "margem positiva" nos números), grafite+limão (é literalmente um dos defaults genéricos de IA citados na skill frontend-design), terracota+creme (esbarra no outro default genérico e no laranja da Shopee).

### Tipografia — 3 papéis

| Papel | Fonte | Uso |
|---|---|---|
| Display | `Fraunces` (já existe) | Títulos, headlines, preço principal em destaque |
| Corpo/UI | `Manrope` (já existe) | Textos, labels, botões, navegação |
| Dados | `Space Grotesk` (**novo**) | Números em tabelas, cartões de comparação, linhas de custo, e o texto interno do selo |

Adicionar `--font-data: 'Space Grotesk', ui-monospace, monospace;` em `src/index.css`, importando a fonte junto das já existentes.

### Cartões e componentes

- `rounded-2xl` (não `rounded-xl`) em cards de resultado/comparação/catálogo
- Fundo `#FFFDF9` (não branco puro) — casa com o canvas quente
- Sombra mais profunda e suave: `0 16px 40px` em tom ink translúcido (ex. `rgba(22,35,63,.1)`), não cinza neutro genérico
- Preço em destaque: `Fraunces`, tamanho maior que o atual
- Linhas de custo/dado: valores em `Space Grotesk`, labels em `Manrope`
- Botões primários: fundo ink sólido, texto brass-claro, `rounded-xl`, sem gradientes

## Elemento-assinatura: Selo "Ribbon de Nota Fiscal"

Faixa diagonal no canto superior-direito do card de resultado, como um carimbo de aprovação de documento/nota fiscal — reforça a metáfora "Tinta & Latão" (papelada, carimbo, autenticação) em vez de uma pílula de status genérica de SaaS.

**Implementação de referência (validada em mockup):**
- Wrapper quadrado (~110×110px) posicionado `top:0; right:0` **dentro** do card, com `overflow: hidden` — é o wrapper que faz o corte, não o card
- Faixa (`width: 160px`) posicionada `top:20px; right:-34px; transform: rotate(45deg)` dentro do wrapper
- **Importante**: o card em si deve ter `overflow: hidden` para o corte funcionar (testado e corrigido durante o brainstorm — se o wrapper for posicionado com offsets negativos *fora* do card e o card também cortar, o selo quebra visualmente)

**Estados de cor** (reaproveita o padrão de alerta que já existe no app):

| Estado | Quando | Cor da faixa | Texto |
|---|---|---|---|
| Aprovada | margem saudável | ink + brass | "APROVADO" |
| Atenção | margem baixa | ink + âmbar | "ATENÇÃO" |
| Crítica | margem negativa/insustentável | ink + vermelho | "REVISAR" |

**Duas variantes de tamanho:**
- **Cheio** (hero) — usado uma vez, no resultado principal da calculadora (Landing)
- **Discreto** (compacto, inline) — usado repetido em listas: comparativo de marketplaces (tag "MELHOR" no de maior margem), catálogo salvo

## Movimento

Um único momento orquestrado, não efeitos espalhados pelo app:

1. Card de resultado aparece com fade+scale sutil (~150-180ms)
2. Selo "carimba" por cima ~250-300ms depois, com rotação+escala de 0 a 1 (`cubic-bezier(.34,1.56,.64,1)`, leve overshoot pra sensação de impacto)

Nada de animação contínua/decorativa em outros lugares. Hover states mudam só sombra/cor, sem movimento. Respeitar `prefers-reduced-motion` (desabilitar a animação de entrada, mostrar elementos já no estado final).

## Menu lateral (Sidebar/AppShell)

- **Paleta**: "Ink Gradiente" — `linear-gradient(180deg, var(--color-ink-950), var(--color-ink-800))` no lugar do `bg-ink-900` sólido atual
- **Item ativo**: "Selo Ativo" — pequena marca quadrada (~14-15px), levemente rotacionada (`-6deg`), borda com a cor do texto; no estado ativo a borda vira brass, fundo com leve tint brass, e um `✓` centralizado aparece. Substitui o destaque atual (`bg-ink-100 text-ink-950` no item ativo)
- Estrutura de navegação (lista de links, ícones lucide-react) permanece a mesma — muda só a cor de fundo e o tratamento do estado ativo

Direções descartadas nesta rodada: "Aba de Caderno" (tab que sai da barra — mais trabalho de recorte visual, adiada), "Rail Expansível" (ícone-only com hover — muda comportamento de interação, não só estilo, fora de escopo desta rodada), "Papel Claro" (sidebar clara — descartada após confirmação explícita do usuário a favor do Ink Gradiente).

## Aplicação por página

| Página/componente | Tratamento |
|---|---|
| `Landing.jsx` (calculadora) | Hero + selo cheio no card de resultado principal |
| `ResultCards.jsx` | Cartão padrão (tokens de cor/tipo/sombra) |
| `ComparativoMarketplaces.jsx` | Vira lista de cartões compactos (não mais tabela HTML), um por marketplace, com selo discreto no de melhor margem |
| `Dashboard.jsx` | Cards de resumo no tratamento padrão; distribuição de margem por marketplace vira barras horizontais em gradiente ink→brass |
| `Catalogo.jsx` | Cartão padrão + selo discreto por produto salvo |
| `Sidebar.jsx` / `AppShell.jsx` | Ink Gradiente + Selo Ativo (ver seção acima) |
| `Configuracoes.jsx`, `Admin.jsx`, `Importar.jsx`, `Resultados.jsx` | Recebem só os tokens base (cor/tipografia/cartão) — sem selo, que fica reservado para telas de resultado/decisão |

## Fora de escopo desta rodada

- Redesign de conteúdo/copy (textos permanecem os mesmos, salvo ajustes pontuais de label)
- Qualquer funcionalidade nova de cálculo/regra de negócio — esta rodada é puramente visual
- "Aba de Caderno" e "Rail Expansível" para o menu (descartados, ver seção Menu lateral)
- Dark mode
