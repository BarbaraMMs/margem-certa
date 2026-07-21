import { useState, useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import { getCondicoes, getMarketplaceLabel, getLastCondicoesAtualizacao } from '../utils/storageUtils'
import {
  SHOPEE_TIERS,
  SHOPEE_TAXA_CAMPANHA_PCT,
  MARKETPLACES_COM_CLASSICO_PREMIUM,
  formatBRL,
  formatPct,
} from '../utils/pricingLogic'
import MarketplaceIcon from './MarketplaceIcon'

const MARKETPLACES_FIXOS = ['mercadolivre', 'shopee', 'amazon']

export default function TabelasVigentes() {
  const [activeTab, setActiveTab] = useState('mercadolivre')
  const condicoes = useMemo(() => getCondicoes(), [])
  const atualizadoEm = useMemo(() => getLastCondicoesAtualizacao(), [])

  const rowsFor = (mkt) => condicoes.filter(r => r.marketplace === mkt && r.categoria)
  const temClassicoPremium = MARKETPLACES_COM_CLASSICO_PREMIUM.includes(activeTab)

  return (
    <section className="bg-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-brass-100 text-brass-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-brass-100">
            <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} /> Tabelas vigentes
          </span>
          <h2 className="font-display text-2xl font-semibold text-ink-950 mb-1">Quanto cada marketplace cobra hoje</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            {atualizadoEm
              ? `Estas são as taxas que a calculadora acima está usando, personalizadas por você em ${atualizadoEm.toLocaleDateString('pt-BR')}.`
              : 'Estas são as taxas padrão de referência que a calculadora acima está usando.'}{' '}
            <a href="/configuracoes" className="text-brass-600 hover:underline font-medium">Editar em Condições Comerciais →</a>
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-brass-100 p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            {MARKETPLACES_FIXOS.map(mkt => (
              <button
                key={mkt}
                onClick={() => setActiveTab(mkt)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === mkt
                    ? 'border-ink-900 text-ink-900 bg-brass-100/40'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MarketplaceIcon marketplace={mkt} sizePx={18} />
                {getMarketplaceLabel(mkt)}
              </button>
            ))}
          </div>

          {activeTab === 'shopee' ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                A Shopee não diferencia taxa por categoria de produto — a comissão e a taxa fixa variam por faixa de preço do item.
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-3">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Valor do item</th>
                      <th className="px-4 py-3 text-center">Comissão</th>
                      <th className="px-4 py-3 text-center">Taxa fixa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SHOPEE_TIERS.map(tier => (
                      <tr key={tier.label}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{tier.label}</td>
                        <td className="px-4 py-2.5 text-center">{formatPct(tier.comissao)}</td>
                        <td className="px-4 py-2.5 text-center">{formatBRL(tier.taxaFixa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>A comissão já contempla a taxa de transação — não há cobrança de processamento de pagamento separada.</p>
                <p>+ Taxa de campanha (opcional): {formatPct(SHOPEE_TAXA_CAMPANHA_PCT)}, só quando você participa de campanhas de destaque (11.11, Páscoa, etc.).</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    {temClassicoPremium ? (
                      <>
                        <th className="px-4 py-3 text-center">Clássico</th>
                        <th className="px-4 py-3 text-center">Premium</th>
                      </>
                    ) : (
                      <th className="px-4 py-3 text-center">Comissão</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rowsFor(activeTab).map(row => (
                    <tr key={row.categoria}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{row.categoria}</td>
                      {temClassicoPremium ? (
                        <>
                          <td className="px-4 py-2.5 text-center">{formatPct(row.classico)}</td>
                          <td className="px-4 py-2.5 text-center">{formatPct(row.premium)}</td>
                        </>
                      ) : (
                        <td className="px-4 py-2.5 text-center">{formatPct(row.classico)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-amber-600 font-medium mt-4">
            ⚠️ Valores de referência. Confira sempre as tarifas oficiais do marketplace antes de precificar em produção.
          </p>
        </div>
      </div>
    </section>
  )
}
