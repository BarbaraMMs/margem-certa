import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Configuracoes from './pages/Configuracoes'
import Importar from './pages/Importar'
import Resultados from './pages/Resultados'
import Catalogo from './pages/Catalogo'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import VisitorModal from './components/VisitorModal'
import { getLocalVisitorData } from './utils/supabaseUtils'

function App() {
  const [showVisitorModal, setShowVisitorModal] = useState(false)

  useEffect(() => {
    // Mostra o modal apenas se o visitante ainda não se identificou
    // e não está na rota /admin
    if (window.location.pathname === '/admin') return
    const existing = getLocalVisitorData()
    if (!existing) {
      // Pequeno delay para a página carregar antes de mostrar o modal
      const t = setTimeout(() => setShowVisitorModal(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function handleVisitorClose() {
    setShowVisitorModal(false)
  }

  return (
    <BrowserRouter>
      {showVisitorModal && (
        <VisitorModal onClose={handleVisitorClose} />
      )}
      <AppShell>
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/importar"      element={<Importar />} />
          <Route path="/resultados"    element={<Resultados />} />
          <Route path="/catalogo"      element={<Catalogo />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/admin"         element={<Admin />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
