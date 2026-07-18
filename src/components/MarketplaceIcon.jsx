import { MARKETPLACE_LOGOS } from '../utils/marketplaceLogos'

export default function MarketplaceIcon({ marketplace, sizePx = 20, className = '' }) {
  const logo = MARKETPLACE_LOGOS[marketplace]

  // Fallback para marketplaces customizados que o seller cadastrou manualmente
  // (não têm logo real disponível).
  if (!logo) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-gray-100 shrink-0 ${className}`}
        style={{ width: sizePx, height: sizePx, fontSize: sizePx * 0.55, lineHeight: 1 }}
      >
        🏪
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm ${logo.bg} ${className}`}
      style={{ width: sizePx, height: sizePx }}
      title={logo.alt}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className={logo.contain ? 'object-contain' : 'w-full h-full object-cover'}
        style={logo.contain ? { width: '70%', height: '70%' } : undefined}
      />
    </span>
  )
}
