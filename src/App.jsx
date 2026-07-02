import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Configuracoes from './pages/Configuracoes'
import Importar from './pages/Importar'
import Resultados from './pages/Resultados'
import Catalogo from './pages/Catalogo'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/importar" element={<Importar />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
