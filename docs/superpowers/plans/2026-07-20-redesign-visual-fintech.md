# Redesign Visual Fintech Ink & Brass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Fintech Ink & Brass" visual system (tokens, the ink-stamp signature element, card language, one orchestrated motion moment, and a refreshed sidebar) across the whole MargemCerta app, per `docs/superpowers/specs/2026-07-20-redesign-visual-fintech-design.md`.

**Architecture:** No new dependencies, no routing/logic changes. Work happens in three layers: (1) design tokens in `src/index.css`, (2) one new reusable component (`MarginStamp.jsx`) that encodes the signature stamp, consumed by (3) targeted edits to existing pages/components (`ResultCards`, `ComparativoMarketplaces`, `Sidebar`, `Dashboard`, `Catalogo`), plus a final mechanical sweep that recolors the `bg-white rounded-2xl` / `border-gray-100` card idiom repeated across ~17 files.

**Tech Stack:** React 19, Tailwind CSS v4 (CSS-first `@theme` config, no `tailwind.config.js`), Vite, `lucide-react`, `react-router-dom` v7. No test framework is installed in this repo (no Jest/Vitest/Playwright wired up, no `tests/` directory) — verification for every task is (a) a quick `node --input-type=module` check for pure-logic pieces, and (b) `npm run dev` + manual check in the browser at the stated route, per this project's own convention ("For UI or frontend changes, start the dev server ... before reporting complete").

## Global Constraints

- No new npm dependencies — everything is plain Tailwind utilities + one new React component.
- Tailwind v4 theme tokens live in `src/index.css` under `@theme` — there is no `tailwind.config.js` to edit.
- All monetary values format through `formatBRL()` / `formatPct()` from `src/utils/pricingLogic.js` — never hand-roll formatting.
- Respect `prefers-reduced-motion` for the two new CSS animations (stamp entrance, card entrance).
- Every step that changes visible UI must be checked with `npm run dev` in a real browser before moving on — this is a pure visual-design change, so nothing here is meaningfully verified by reading the diff alone.

---

## Task 1: Design tokens — font, card color

**Files:**
- Modify: `src/index.css:1` (font import), `src/index.css:4-43` (`@theme` block)

**Interfaces:**
- Produces: Tailwind utility classes `font-data` (Space Grotesk, for numbers/data), `bg-card` / `border-card` / `text-card` (new `--color-card: #FFFDF9`, the warm off-white card surface used everywhere from Task 8 onward).

- [ ] **Step 1: Add the Space Grotesk import and the two new theme tokens**

In `src/index.css`, replace line 1:

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');
```

with:

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
```

Then, inside the `@theme { ... }` block, change:

```css
  --color-canvas: #FBFAF8;
```

to:

```css
  --color-canvas: #FBFAF8;
  --color-card: #FFFDF9;
```

And change:

```css
  --font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Fraunces', ui-serif, Georgia, serif;
```

to:

```css
  --font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Fraunces', ui-serif, Georgia, serif;
  --font-data: 'Space Grotesk', ui-monospace, monospace;
```

- [ ] **Step 2: Verify the dev server picks up the new tokens**

Run: `npm run dev`

Open the printed local URL in a browser, open devtools, and in the console run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--font-data')
```

Expected: `"Space Grotesk", ui-monospace, monospace` (or equivalent — confirms the theme var compiled).

Also add a temporary `<div class="font-data bg-card">` anywhere on screen (e.g. paste in devtools: `document.body.insertAdjacentHTML('afterbegin', '<div class="font-data bg-card p-4">test</div>')`) and confirm the text switches to the Space Grotesk look and the background is a warm off-white, not stark white. Remove the temporary div after checking (refresh the page).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add Space Grotesk data font and card color tokens"
```

---

## Task 2: Build the `MarginStamp` signature component + animations

**Files:**
- Create: `src/components/MarginStamp.jsx`
- Modify: `src/index.css` (append animation keyframes at end of file)

**Interfaces:**
- Consumes: `getDiagnostico(margemReal, margemAlvo)` from `src/utils/pricingLogic.js:330` — already exists, returns `{ nivel: 'critico'|'atencao'|'saudavel', cor, titulo, mensagem, acao }`. This task only uses `.nivel`.
- Produces: `export default function MarginStamp({ nivel, variant })` where `nivel` is `'critico' | 'atencao' | 'saudavel'` and `variant` is `'cheio' | 'discreto'` (default `'discreto'`). Later tasks (3, 4, 7) import this as `import MarginStamp from '../components/MarginStamp'` (from `pages/`) or `import MarginStamp from './MarginStamp'` (from `components/`).
- Produces CSS classes: `.mc-stamp-anim`, `.mc-card-anim` (used by Task 3).

- [ ] **Step 1: Confirm `getDiagnostico`'s 3 states with a quick manual check (no test framework exists, this is the closest equivalent)**

Run:

```bash
node --input-type=module -e "import { getDiagnostico } from './src/utils/pricingLogic.js'; console.log(getDiagnostico(0.03, 15).nivel); console.log(getDiagnostico(0.10, 15).nivel); console.log(getDiagnostico(0.20, 15).nivel);"
```

Expected output (3 lines):
```
critico
atencao
saudavel
```

This confirms the exact 3 string values `MarginStamp` must branch on.

- [ ] **Step 2: Create `src/components/MarginStamp.jsx`**

```jsx
const NIVEL_ESTILO = {
  saudavel: { texto: 'text-brass-100', label: 'APROVADO' },
  atencao:  { texto: 'text-amber-300', label: 'ATENÇÃO' },
  critico:  { texto: 'text-red-300',   label: 'REVISAR' },
}

/**
 * Selo de assinatura visual do MargemCerta — carimbo de tinta que reforça o
 * diagnóstico de margem já calculado por getDiagnostico() em pricingLogic.js.
 * variant="cheio": faixa diagonal de canto, para o card de resultado principal.
 *   O elemento pai PRECISA ter `relative` (position) — o wrapper abaixo se
 *   posiciona flush no canto (top-0 right-0) e recorta a própria faixa com
 *   `rounded-tr-2xl overflow-hidden`, para acompanhar o raio do card sem
 *   exigir `overflow-hidden` no card inteiro (isso importa porque alguns
 *   cards têm outros elementos, como o badge "Melhor opção", que precisam
 *   poder ultrapassar a borda do card — ver Task 3).
 * variant="discreto": tag inline compacta, para uso repetido em listas.
 */
export default function MarginStamp({ nivel, variant = 'discreto' }) {
  const estilo = NIVEL_ESTILO[nivel] || NIVEL_ESTILO.atencao

  if (variant === 'cheio') {
    return (
      <div className="absolute top-0 right-0 w-[110px] h-[110px] overflow-hidden rounded-tr-2xl pointer-events-none" aria-hidden="true">
        <div className={`mc-stamp-anim absolute top-5 -right-8 w-40 text-center py-1 text-[9.5px] font-bold tracking-[2px] shadow-md bg-ink-900 ${estilo.texto}`}>
          {estilo.label}
        </div>
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold tracking-wide -rotate-1 bg-ink-900 ${estilo.texto}`}>
      {estilo.label}
    </span>
  )
}
```

- [ ] **Step 3: Append the animation CSS to `src/index.css`**

At the end of the file (after the existing `input[type="range"]::-moz-range-thumb { ... }` block), add:

```css

/* Selo de assinatura (MarginStamp) e entrada do card de resultado — ver
   docs/superpowers/specs/2026-07-20-redesign-visual-fintech-design.md */
@keyframes mc-stamp-in {
  0%   { transform: rotate(45deg) scale(0); }
  60%  { transform: rotate(45deg) scale(1.08); }
  100% { transform: rotate(45deg) scale(1); }
}

.mc-stamp-anim {
  transform: rotate(45deg) scale(0);
  animation: mc-stamp-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s forwards;
}

@keyframes mc-card-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.mc-card-anim {
  opacity: 0;
  animation: mc-card-in 0.18s ease-out 0.05s forwards;
}

@media (prefers-reduced-motion: reduce) {
  .mc-stamp-anim {
    animation: none;
    transform: rotate(45deg) scale(1);
  }
  .mc-card-anim {
    animation: none;
    opacity: 1;
  }
}
```

- [ ] **Step 4: Visual smoke test**

Run: `npm run dev`

In the browser devtools console, mount a throwaway check by temporarily editing `src/App.jsx` is unnecessary — instead just confirm the file compiles with no errors: check the Vite terminal output for the dev server has no red error overlay/compile error after saving both files. Expected: no errors in the terminal or browser overlay.

- [ ] **Step 5: Commit**

```bash
git add src/components/MarginStamp.jsx src/index.css
git commit -m "feat: add MarginStamp signature component and entrance animations"
```

---

## Task 3: Apply the stamp + card entrance to `ResultCards.jsx` (calculator hero result)

**Files:**
- Modify: `src/components/ResultCards.jsx` (all of it — see exact replacement below)
- Modify: `src/pages/Landing.jsx:247` (thread the new `margemAlvo` prop)

**Interfaces:**
- Consumes: `MarginStamp` from Task 2, `getDiagnostico` from `pricingLogic.js`.
- Produces: `ResultCards` now requires a `margemAlvo` prop (number, e.g. `15`) in addition to the existing `resultados` and `marketplace` props.

- [ ] **Step 1: Update `ResultCards.jsx` to compute and render the stamp**

Replace the full contents of `src/components/ResultCards.jsx` with:

```jsx
import { useState, Fragment } from 'react'
import { formatBRL, formatPct, getDiagnostico, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import MarginStamp from './MarginStamp'

function DetalhamentoTable({ dados }) {
  return (
    <div className="mt-4 rounded-2xl border border-brass-100 bg-gray-50 p-4 text-sm text-gray-700">
      {dados.faixaPrecoShopee && (
        <p className="mb-3 text-orange-700 font-medium">
          Faixa de preço Shopee aplicada: {dados.faixaPrecoShopee}
        </p>
      )}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Linha de custo</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">R$</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">%</span>
        {dados.detalheTaxas.itens.map((item, i) => (
          <Fragment key={i}>
            <span className="text-gray-600">{item.label}</span>
            <span className="font-data font-medium text-gray-800 text-right">{formatBRL(item.valor)}</span>
            <span className="font-data text-gray-500 text-right">{formatPct(item.valor / dados.precoIdeal)}</span>
          </Fragment>
        ))}
        <span className="font-semibold border-t border-gray-200 pt-2 mt-1">Preço ideal calculado</span>
        <span className="font-data font-semibold border-t border-gray-200 pt-2 mt-1 text-right">{formatBRL(dados.precoIdeal)}</span>
        <span className="font-data font-semibold border-t border-gray-200 pt-2 mt-1 text-right">100,0%</span>
      </div>
    </div>
  )
}

function ResultCard({ titulo, dados, destaque, margemAlvo }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!dados) return null

  if (dados.error) {
    return (
      <div className="flex-1 bg-card rounded-2xl border-2 border-red-200 p-6 shadow-md">
        <h3 className="text-base font-semibold text-gray-700 mb-2">{titulo}</h3>
        <p className="text-sm text-red-500">{dados.error}</p>
      </div>
    )
  }

  const diag = getDiagnostico(dados.margemReal, margemAlvo)

  return (
    <div className={`mc-card-anim relative flex-1 bg-card rounded-2xl border-2 p-6 shadow-[0_16px_40px_rgba(22,35,63,0.1)] transition-all
      ${destaque ? 'border-green-400 ring-2 ring-green-100' : 'border-brass-100'}`}>
      <MarginStamp nivel={diag.nivel} variant="cheio" />
      {destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ✓ Melhor opção
        </span>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-4">{titulo}</h3>
      <div className="space-y-3">
        <div className="flex flex-col gap-1 py-2 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Preço de venda ideal</span>
            <span className={`font-display ${destaque ? 'text-5xl font-black' : 'text-4xl font-black'} text-ink-900`}>{formatBRL(dados.precoIdeal)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Custo ajustado / (1 - total de taxas)</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Comissão do marketplace</span>
            <span className="font-data text-sm font-medium text-gray-700">{formatBRL(dados.feeEmReais)}</span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal × taxa do marketplace</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Lucro por unidade</span>
            <span className={`font-data text-sm font-semibold ${dados.lucroPorUnidade >= 0 ? 'text-profit' : 'text-red-500'}`}>
              {formatBRL(dados.lucroPorUnidade)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Preço ideal - custo ajustado - outras taxas</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Margem líquida real</span>
            <span className={`font-data text-sm font-bold ${dados.margemReal >= 0.05 ? 'text-profit' : 'text-red-500'}`}>
              {formatPct(dados.margemReal)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Lucro por unidade / preço ideal</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Markup total</span>
            <span className="font-data text-sm text-gray-700">{formatPct(dados.markup)}</span>
          </div>
          <p className="text-[11px] text-gray-400">(Preço ideal - custo total) / custo total</p>
        </div>
      </div>
      <button
        onClick={() => setShowDetails((prev) => !prev)}
        className="mt-5 w-full text-left text-sm font-medium text-brass-600 hover:text-brass-700"
      >
        {showDetails ? 'Ocultar' : 'Como chegamos neste preço'}
      </button>
      {showDetails && <DetalhamentoTable dados={dados} />}
    </div>
  )
}

export default function ResultCards({ resultados, marketplace, margemAlvo }) {
  if (!resultados) return null

  const temClassicoPremium = MARKETPLACES_COM_CLASSICO_PREMIUM.includes(marketplace)

  if (!temClassicoPremium) {
    const unico = resultados.classico?.melhorOpcao ? resultados.classico
      : resultados.premium?.melhorOpcao ? resultados.premium
      : resultados.classico || resultados.premium

    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">4</span>
          Resultado
        </h2>
        <ResultCard titulo="Preço ideal" dados={unico} destaque={false} margemAlvo={margemAlvo} />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900 text-sm font-bold mr-2">4</span>
        Resultado: Clássico vs Premium
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <ResultCard titulo="Anúncio Clássico" dados={resultados.classico} destaque={resultados.classico?.melhorOpcao} margemAlvo={margemAlvo} />
        <ResultCard titulo="Anúncio Premium" dados={resultados.premium} destaque={resultados.premium?.melhorOpcao} margemAlvo={margemAlvo} />
      </div>
    </div>
  )
}
```

Note: `getDiagnostico` must be added to the existing named-export import from `pricingLogic.js` — it's already exported there (`pricingLogic.js:330`), this task only adds it to the import list.

- [ ] **Step 2: Thread `margemAlvo` from `Landing.jsx`**

In `src/pages/Landing.jsx`, find (around line 247):

```jsx
          <div ref={step4Ref} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <ResultCards resultados={resultados} marketplace={marketplace} />
          </div>
```

Change the `ResultCards` line to:

```jsx
            <ResultCards resultados={resultados} marketplace={marketplace} margemAlvo={sliders.margemAlvo} />
```

(Leave the surrounding `bg-white rounded-2xl shadow-md p-6 border border-gray-100` wrapper untouched here — Task 8 recolors it along with every other occurrence.)

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/` in the browser.

Check, for the default inputs (Mercado Livre, custo 35, frete 8, ads 8%, imposto 6%, devolução 1%, margemAlvo 15%):
- The result card(s) show a diagonal ribbon in the top-right corner reading "APROVADO", "ATENÇÃO" or "REVISAR" depending on the computed margin — the default inputs should land on "ATENÇÃO" or "APROVADO" (verify against what's on screen, both are valid, just confirm it's not visually clipped/broken).
- The ribbon is fully contained within the card's rounded top-right corner — nothing pokes out above or beside the card (this was the bug found and fixed during brainstorming: the stamp's own wrapper must be flush at `top-0 right-0` with `rounded-tr-2xl overflow-hidden` matching the card's corner radius, not offset negative).
- If the Mercado Livre "Clássico vs Premium" comparison is showing (default marketplace) and one side is the better option, its green "✓ Melhor opção" badge (which floats above the card's top border) is still fully visible, not clipped — this badge and the corner ribbon must coexist without either one cutting the other off.
- Reload the page a few times and confirm the card fades in and the ribbon "stamps" in shortly after, matching the approved mockup's motion.
- In devtools, enable "Emulate CSS media feature prefers-reduced-motion: reduce" (Rendering tab) and reload — confirm the card and ribbon appear instantly with no animation.
- Change the margin target slider (Passo 3) to a very low value (e.g. type a custo produto of 90 to force a low/negative margin) and confirm the ribbon switches to "REVISAR" with a red-tinted label.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultCards.jsx src/pages/Landing.jsx
git commit -m "feat: add margin stamp and entrance motion to the calculator result card"
```

---

## Task 4: Rebuild `ComparativoMarketplaces.jsx` as a card list with the discreet stamp

**Files:**
- Modify: `src/components/ComparativoMarketplaces.jsx` (full replacement)

**Interfaces:**
- Consumes: `MarginStamp` (variant `discreto`) from Task 2, `getDiagnostico` from `pricingLogic.js`.
- Produces: no external interface change — still `<ComparativoMarketplaces costs sliders condicoes categoria marketplace customFees campanhaShopee />`, same as today.

This removes the separate desktop `<table>` and mobile-only `<div className="sm:hidden">` card list (which duplicated the same data twice) in favor of one responsive card grid — per the approved spec ("vira lista de cartões compactos, não mais tabela HTML"), and it's also a DRY win since the two blocks were rendering the same 7 data points twice.

- [ ] **Step 1: Replace the full contents of `src/components/ComparativoMarketplaces.jsx`**

```jsx
import { useMemo } from 'react'
import { Scale, Info } from 'lucide-react'
import { calcularPrecificacao, formatBRL, formatPct, getDiagnostico, MARKETPLACES_COM_CLASSICO_PREMIUM } from '../utils/pricingLogic'
import { getMarketplaces, getCondicoes } from '../utils/storageUtils'
import MarketplaceIcon from './MarketplaceIcon'
import MarginStamp from './MarginStamp'

export default function ComparativoMarketplaces({ costs, sliders, condicoes, categoria, marketplace, customFees, campanhaShopee }) {
  const condicoesAtivas = useMemo(() => condicoes || getCondicoes(), [condicoes])

  const linhas = useMemo(() => {
    const marketplaces = getMarketplaces(condicoesAtivas)

    return marketplaces
      .map(mkt => {
        const resultado = calcularPrecificacao({
          ...costs,
          marketplace: mkt.id,
          categoria: categoria || null,
          ...sliders,
          condicoes: condicoesAtivas,
          customFees: mkt.id === marketplace ? customFees : null,
          campanhaShopee: mkt.id === 'shopee' && mkt.id === marketplace && campanhaShopee,
        })

        const cl = resultado?.classico
        const pr = resultado?.premium
        let melhor = null
        let tipo = null

        if (cl && !cl.error && pr && !pr.error) {
          if (cl.margemReal >= pr.margemReal) { melhor = cl; tipo = 'Clássico' }
          else                                { melhor = pr; tipo = 'Premium'  }
        } else if (cl && !cl.error) { melhor = cl; tipo = 'Clássico' }
        else if (pr && !pr.error)   { melhor = pr; tipo = 'Premium'  }

        // Só o Mercado Livre tem, de fato, tipos de anúncio diferentes.
        if (melhor && !MARKETPLACES_COM_CLASSICO_PREMIUM.includes(mkt.id)) tipo = '—'

        return { mkt, melhor, tipo }
      })
      .filter(l => l.melhor != null)
      .sort((a, b) => b.melhor.margemReal - a.melhor.margemReal)
  }, [costs, sliders, condicoesAtivas, categoria, marketplace, customFees, campanhaShopee])

  if (!linhas.length) return null

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brass-100 text-ink-900">
          <Scale className="w-4 h-4" strokeWidth={2} />
        </span>
        Comparativo entre Marketplaces
      </h2>
      <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-4 ml-9">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
        Este comparativo usa os mesmos custos que você preencheu acima e recalcula o preço ideal e a margem para cada marketplace configurado em Condições Comerciais.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {linhas.map(({ mkt, melhor, tipo }, i) => {
          const isMelhor = i === 0
          const custosFixosExtras = (melhor.detalheTaxas.taxaFixaReais || 0) + (melhor.detalheTaxas.freteCoParticipacaoReais || 0)
          const custoTransacao = ((melhor.detalheTaxas.taxaTransacao || 0) + (melhor.detalheTaxas.taxaCampanha || 0)) * melhor.precoIdeal
          const diag = getDiagnostico(melhor.margemReal, sliders.margemAlvo)

          return (
            <div
              key={mkt.id}
              className={`rounded-2xl border p-4 shadow-[0_16px_40px_rgba(22,35,63,0.06)] bg-card ${isMelhor ? 'border-brass-400 ring-2 ring-brass-100' : 'border-brass-100'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-gray-800 inline-flex items-center gap-2">
                  <MarketplaceIcon marketplace={mkt.id} sizePx={18} />
                  {mkt.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isMelhor && (
                    <span className="text-[10px] bg-brass-100 text-brass-800 px-2 py-0.5 rounded-full font-bold">★ Melhor</span>
                  )}
                  <MarginStamp nivel={diag.nivel} variant="discreto" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Anúncio</p>
                  <p className="font-data font-medium text-gray-700">{tipo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Taxa aplicada</p>
                  <p className="font-data font-medium text-gray-700">{formatPct(melhor.detalheTaxas.taxaMarketplace)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custos fixos extras</p>
                  <p className="font-data font-medium text-gray-700">
                    {custosFixosExtras > 0 ? formatBRL(custosFixosExtras) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Custo de transação</p>
                  <p className="font-data font-medium text-gray-700">
                    {custoTransacao > 0 ? formatBRL(custoTransacao) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Preço ideal</p>
                  <p className="font-data font-semibold text-gray-800">{formatBRL(melhor.precoIdeal)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Margem</p>
                  <p className="font-data font-bold text-gray-800">{formatPct(melhor.margemReal)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-400 text-xs">Lucro / un.</span>
                <span className={`font-data font-semibold text-sm ${melhor.lucroPorUnidade >= 0 ? 'text-profit' : 'text-red-500'}`}>
                  {formatBRL(melhor.lucroPorUnidade)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ★ = melhor margem entre os marketplaces configurados. Taxas baseadas em Condições Comerciais — ajuste em <a href="/configuracoes" className="underline hover:text-gray-600">Condições Comerciais</a>.
      </p>

      <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500 leading-relaxed">
        <p className="font-medium text-gray-600 mb-1">Por que os preços ideais são tão diferentes entre marketplaces?</p>
        <p>
          Todos são calculados para atingir a <strong>mesma margem líquida alvo</strong> — a diferença no preço final vem de quatro fatores: (1) a <strong>taxa aplicada</strong> (comissão %) muda por marketplace e categoria; (2) alguns marketplaces cobram <strong>custos fixos extras</strong> por venda — taxa fixa por item na Shopee, ou frete obrigatório abaixo de R$79 no Mercado Livre; (3) o <strong>custo de transação</strong> (processamento de pagamento) só existe fora da comissão no Mercado Livre — cerca de 4,99% via Mercado Pago; na Shopee a taxa de transação já vem embutida na comissão (só entra por fora a taxa de campanha opcional de 2,5%, se ativada); (4) o marketplace com a maior soma desses custos precisa de um preço maior para sobrar a mesma margem no final.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `/`, scroll to "Comparativo entre Marketplaces".

Check:
- One card per configured marketplace, in a 2-column grid on desktop and 1-column on narrow/mobile width (resize the browser or use devtools device toolbar).
- The card with the best margin has a brass ring/border and a "★ Melhor" tag.
- Every card also shows its own small discreet stamp ("APROVADO"/"ATENÇÃO"/"REVISAR") reflecting that marketplace's own margin health — these two signals (rank vs. health) can legitimately disagree, e.g. the "best" marketplace among a bad set might still show "ATENÇÃO".
- No leftover `<table>` renders — view page source / React DevTools to confirm the old `<table>` element is gone.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComparativoMarketplaces.jsx
git commit -m "refactor: unify marketplace comparison into one responsive card list with margin stamps"
```

---

## Task 5: Sidebar — Ink Gradiente background + Selo Ativo icon treatment

**Files:**
- Modify: `src/components/Sidebar.jsx` (full replacement)

**Interfaces:** none external — `Sidebar` still takes no props, still renders the same 5 routes.

- [ ] **Step 1: Replace the full contents of `src/components/Sidebar.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Calculator, LayoutDashboard, Package, Upload, SlidersHorizontal, Menu, X } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Calculadora', exact: true, icon: Calculator },
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/catalogo', label: 'Catálogo', icon: Package },
  { to: '/importar', label: 'Importar Produtos', icon: Upload },
  { to: '/configuracoes', label: 'Condições Comerciais', icon: SlidersHorizontal },
]

const SIDEBAR_BG = 'bg-gradient-to-b from-ink-950 to-ink-800'

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-brass-600 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-ink-950 font-bold text-sm">M</span>
      </div>
      <span className="font-display font-semibold text-white text-lg">MargemCerta</span>
    </div>
  )
}

function NavLinks({ onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'text-brass-100 bg-brass-500/10'
        : 'text-ink-100/70 hover:bg-ink-800/60 hover:text-white'
    }`

  const iconWrapClass = (isActive) =>
    `flex items-center justify-center w-6 h-6 rounded-[3px] border shrink-0 transition-all ${
      isActive
        ? 'border-brass-400 bg-brass-400/15 -rotate-6'
        : 'border-transparent'
    }`

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ to, label, exact, icon: Icon }) => (
        <NavLink key={to} to={to} end={exact} className={linkClass} onClick={onNavigate}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Icon className="w-[14px] h-[14px] shrink-0" strokeWidth={2.5} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 w-60 ${SIDEBAR_BG} flex-col gap-8 px-4 py-6 z-30`}>
        <div className="px-1">
          <Brand />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className={`md:hidden fixed top-0 left-0 right-0 h-14 ${SIDEBAR_BG} flex items-center justify-between px-4 z-40`}>
        <Brand />
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-ink-100 hover:bg-ink-800"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] ${SIDEBAR_BG} flex flex-col gap-8 px-4 py-6 shadow-xl`}>
            <div className="flex items-center justify-between px-1">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-ink-100 hover:bg-ink-800"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
```

Note on the deviation from the brainstorm mockup: the mockup's "Selo Ativo" was a standalone stamp mark next to a text-only label (no icon). The real sidebar already carries a `lucide-react` icon per link, so adding a second separate stamp mark next to the icon would be redundant clutter. This version applies the same idea — a small rotated, bordered, brass-accented square — directly as the icon's container, so the icon itself becomes the "stamp" when active, instead of introducing a duplicate element.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open any route.

Check:
- Sidebar background is a subtle top-to-bottom gradient (darker near the top), not the flat solid navy from before — compare by temporarily disabling GPU rendering isn't necessary, just look for a visible gradient especially in the corners.
- The active nav item's icon sits inside a small rotated square with a brass border/tint; inactive icons have no border.
- Click through all 5 links (`/`, `/dashboard`, `/catalogo`, `/importar`, `/configuracoes`) and confirm the active indicator moves correctly each time.
- Resize to mobile width, open the hamburger menu, and confirm the drawer has the same gradient and active-icon treatment.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat: sidebar Ink Gradiente background and stamp-style active icon"
```

---

## Task 6: Dashboard — card tokens + explicit note on keeping semantic bar colors

**Files:**
- Modify: `src/pages/Dashboard.jsx:9-23` (`SummaryCard`), `src/pages/Dashboard.jsx:40` (`BarraHorizontal` track color)

**Interfaces:** none external.

The spec says dashboard bars should use an "ink→brass gradient", but `BarraHorizontal`'s red/amber/green fill is load-bearing information — the page's own header text says "Produtos críticos são aqueles com margem abaixo de 5%", and there's a 3-color legend right below the chart explaining green/amber/red. Recoloring the fill to a uniform ink/brass gradient would silently break that legend and remove the at-a-glance critical/healthy signal. This task keeps the semantic fill colors and only re-tints the surrounding chrome (card tokens, track background) — this is a deliberate, documented deviation from a literal reading of the spec, not an oversight.

- [ ] **Step 1: Update `SummaryCard`'s "gray" color variant**

In `src/pages/Dashboard.jsx`, find:

```jsx
  const cores = {
    green:  'bg-green-50 border-green-100 text-green-700',
    red:    'bg-red-50 border-red-100 text-red-600',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    gray:   'bg-white border-gray-100 text-gray-700',
  }
```

Change the `gray` line to:

```jsx
    gray:   'bg-card border-brass-100 text-gray-700',
```

(This one needed a manual fix because `bg-white` and `border-gray-100` here are split across a template literal and a separate string, so the mechanical sweep in Task 8 — which matches `bg-white rounded-2xl` as one adjacent phrase — won't catch it.)

- [ ] **Step 2: Warm up the bar track color**

In the same file, find in `BarraHorizontal`:

```jsx
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
```

Change to:

```jsx
      <div className="flex-1 bg-brass-50 rounded-full h-4 overflow-hidden">
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. If the catalog is empty, first go to `/` and save at least 2-3 products with different margins (one healthy ≥15%, one below 5%) via "Salvar produto no catálogo", then open `/dashboard`.

Check:
- The "Produtos salvos" summary card (gray variant) has the warm off-white background, not stark white.
- The margin-per-marketplace bars still render green/amber/red per the legend beneath the chart — confirm a product you saved with <5% margin shows a red bar and appears in the "Críticos" list.
- The bar track (the background pill behind each colored bar) is a very light warm tan, not cool gray.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "style: warm up Dashboard card and bar-track tokens, keep semantic health colors"
```

---

## Task 7: Catálogo — add the discreet stamp to saved product cards

**Files:**
- Modify: `src/pages/Catalogo.jsx:5` (import), `src/pages/Catalogo.jsx:171-185` (product card body)

**Interfaces:**
- Consumes: `MarginStamp` (variant `discreto`), `getDiagnostico`.

- [ ] **Step 1: Add the imports**

In `src/pages/Catalogo.jsx`, change:

```jsx
import { calcularMelhorOferta, formatBRL, formatPct } from '../utils/pricingLogic'
```

to:

```jsx
import { calcularMelhorOferta, formatBRL, formatPct, getDiagnostico } from '../utils/pricingLogic'
import MarginStamp from '../components/MarginStamp'
```

- [ ] **Step 2: Render the stamp next to the price**

Find this block (inside the `.map(produto => ...)`):

```jsx
                  {melhor ? (
                    <>
                      <p className="text-xl font-bold text-green-700">{formatBRL(melhor.precoIdeal)}</p>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-semibold ${corMargem(melhor.margemReal)}`}>
                          Margem real: {formatPct(melhor.margemReal)}
                        </p>
                        <p className={`text-sm font-medium ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          Lucro/un.: {formatBRL(melhor.lucroPorUnidade)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-red-400">Erro ao calcular</p>
                  )}
```

Replace with:

```jsx
                  {melhor ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-data text-xl font-bold text-green-700">{formatBRL(melhor.precoIdeal)}</p>
                        <MarginStamp nivel={getDiagnostico(melhor.margemReal, produto.sliders.margemAlvo).nivel} variant="discreto" />
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`font-data text-sm font-semibold ${corMargem(melhor.margemReal)}`}>
                          Margem real: {formatPct(melhor.margemReal)}
                        </p>
                        <p className={`font-data text-sm font-medium ${melhor.lucroPorUnidade >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          Lucro/un.: {formatBRL(melhor.lucroPorUnidade)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-red-400">Erro ao calcular</p>
                  )}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/catalogo` with at least one saved product (save one from `/` first if the catalog is empty).

Check:
- Each product card shows a small discreet stamp next to its price.
- A product with a healthy margin shows "APROVADO"; if you have one with a low margin, it shows "ATENÇÃO" or "REVISAR".
- Card layout doesn't break/overflow on narrow mobile width.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Catalogo.jsx
git commit -m "feat: add margin stamp to saved product cards in Catálogo"
```

---

## Task 8: Global card-token sweep

**Files:**
- Modify (mechanically, via script): every `.jsx` file under `src/` that contains the literal substrings `bg-white rounded-2xl` and/or `border-gray-100`.

**Interfaces:** none — purely cosmetic class-name substitution, no logic touched.

This is the single highest-leverage step for making the redesign feel like it covers "the whole app" rather than just the calculator: the same `bg-white rounded-2xl ... border border-gray-100 ... shadow-md|shadow-sm` card idiom is repeated by hand across 17 files. Two substring replacements, verified safe by grep below, recolor nearly every card/modal in the app to the new warm tokens in one pass:

1. `bg-white rounded-2xl` → `bg-card rounded-2xl` — verified every occurrence of this exact adjacent phrase in the codebase is a card or modal container, never a button/badge/table-row class (a plain `bg-white` used alone, e.g. on a CTA button, is untouched because the phrase requires `rounded-2xl` immediately after).
2. `border-gray-100` → `border-brass-100` — recolors card borders and `border-t border-gray-100` divider rules to the warm palette consistently.
3. `bg-ink-900 hover:bg-ink-800 text-white` → `bg-ink-900 hover:bg-ink-800 text-brass-100` — covers the spec's "botões primários... texto brass-claro" requirement. Verified every occurrence of this exact phrase is a primary button.
4. `bg-ink-900 text-white` → `bg-ink-900 text-brass-100` — the same button idiom without a hover state (e.g. a disabled variant). Verified this exact adjacent phrase never appears inside a larger surface like the footer/CTA sections (those have other classes between `bg-ink-900` and `text-white`, e.g. `bg-ink-900 py-16 px-6 text-center`, so this narrow substring doesn't match them).

`shadow-md` / `shadow-sm` are intentionally left alone in this task — they're used far more broadly than just on cards (buttons, badges, etc.), so a blind sweep there is riskier for comparatively little visual payoff; the background/border swap is what actually reads as "the new palette".

- [ ] **Step 1: Confirm the current occurrence counts (baseline)**

Run:

```bash
grep -rc "bg-white rounded-2xl" src --include="*.jsx" | grep -v ":0"
grep -rc "border-gray-100" src --include="*.jsx" | grep -v ":0"
grep -rc "bg-ink-900 hover:bg-ink-800 text-white" src --include="*.jsx" | grep -v ":0"
grep -rc "bg-ink-900 text-white" src --include="*.jsx" | grep -v ":0"
```

Note the file list and total — this is what Step 3 will diff against.

- [ ] **Step 2: Run the sweep**

```bash
node -e "
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.jsx')) out.push(p);
  }
  return out;
}

const files = walk('src');
let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original
    .split('bg-white rounded-2xl').join('bg-card rounded-2xl')
    .split('border-gray-100').join('border-brass-100')
    .split('bg-ink-900 hover:bg-ink-800 text-white').join('bg-ink-900 hover:bg-ink-800 text-brass-100')
    .split('bg-ink-900 text-white').join('bg-ink-900 text-brass-100');
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed++;
    console.log('updated:', file);
  }
}
console.log('Total files changed:', changed);
"
```

Expected: a list of ~15-17 file paths printed, ending with `Total files changed: <N>` where N matches the file count from Step 1's grep.

- [ ] **Step 3: Verify no stray occurrences remain and nothing broke**

```bash
grep -rn "bg-white rounded-2xl" src --include="*.jsx"
grep -rn "border-gray-100" src --include="*.jsx"
grep -rn "bg-ink-900 hover:bg-ink-800 text-white" src --include="*.jsx"
grep -rn "bg-ink-900 text-white" src --include="*.jsx"
```

Expected: all four commands print nothing (exit with no matches).

Then run:

```bash
npm run dev
```

Expected: Vite compiles cleanly, no red error overlay.

- [ ] **Step 4: Manual visual pass**

With the dev server running, open each of these routes and confirm cards/modals look warm off-white with a soft brass-tinted border, not stark white/cool gray, and nothing looks visually broken (misaligned borders, invisible text, etc.):

- `/` (Landing) — all the numbered step cards, and the primary buttons ("Salvar produto no catálogo", the modal's "Salvar" button) now show cream/brass text on the ink background instead of plain white.
- `/dashboard`
- `/catalogo` — "Exportar catálogo" and "Recalcular" buttons.
- `/importar`
- `/configuracoes`
- Open the "Salvar produto" modal from `/` and the upgrade modal (trigger by trying to export a catalog on the free plan, or check `/catalogo` if `LIMITE_CATALOGO_FREE` is exceeded) — confirm modals also picked up the new background and button text color.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style: sweep card and primary-button tokens to bg-card/border-brass-100/text-brass-100 app-wide"
```

---

## Task 9: Reduced motion + final end-to-end QA pass

**Files:** none (verification-only task).

- [ ] **Step 1: Reduced-motion regression check**

In Chrome/Edge devtools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → `reduce`.

Reload `/`, fill in the calculator so a result renders. Confirm the result card and its stamp appear instantly in their final state (no fade, no rotate-in). Turn the emulation back to "No emulation" and reload again — confirm the animation is back.

- [ ] **Step 2: Full route walkthrough**

Run `npm run dev` and, in a normal (non-reduced-motion) browser window, visit every route and do a quick pass:

- `/` — fill the calculator, confirm hero stamp + comparativo cards + sidebar all look consistent with the new tokens.
- `/dashboard` — with at least 3 saved products (mix of healthy/critical margins), confirm summary cards, bars, and the product list all render correctly.
- `/catalogo` — confirm each card shows its stamp and the layout holds on mobile width (devtools device toolbar, e.g. 375px).
- `/importar`, `/configuracoes`, `/admin` (if reachable) — confirm these unaffected-by-design pages still render fine after the Task 8 sweep (they only got token recoloring, no structural change).

- [ ] **Step 3: Fix anything found, otherwise this task is done — no commit needed if nothing changed.**

If any visual regression is found during this pass, fix it directly in the relevant file from the task that touched it, re-run the check, and commit with a message like `fix: <what was broken>` before considering the redesign complete.
