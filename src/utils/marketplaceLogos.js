import logoML  from '../assets/logo-mercadolivre.png'
import logoSP  from '../assets/logo-shopee.jpg'
import logoAMZ from '../assets/logo-amazon.svg'

// ——— Logos reais dos marketplaces — fonte única usada em todas as telas ———
export const MARKETPLACE_LOGOS = {
  mercadolivre: { src: logoML,  alt: 'Mercado Livre', bg: 'bg-[#FFE600]' },
  shopee:       { src: logoSP,  alt: 'Shopee',         bg: 'bg-white' },
  // O SVG da Amazon é bem mais largo que alto — "cover" cortava a seta/sorriso na base.
  amazon:       { src: logoAMZ, alt: 'Amazon',         bg: 'bg-white border border-gray-200', contain: true },
}
