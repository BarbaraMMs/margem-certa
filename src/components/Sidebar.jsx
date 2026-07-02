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
        ? 'bg-ink-100 text-ink-950'
        : 'text-ink-100/80 hover:bg-ink-800 hover:text-white'
    }`

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ to, label, exact, icon: Icon }) => (
        <NavLink key={to} to={to} end={exact} className={linkClass} onClick={onNavigate}>
          <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
          {label}
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
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-ink-900 flex-col gap-8 px-4 py-6 z-30">
        <div className="px-1">
          <Brand />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-ink-900 flex items-center justify-between px-4 z-40">
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
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-900 flex flex-col gap-8 px-4 py-6 shadow-xl">
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
