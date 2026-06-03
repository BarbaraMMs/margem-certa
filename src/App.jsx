import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Configuracoes from './pages/Configuracoes'
import Importar from './pages/Importar'
import Resultados from './pages/Resultados'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-14">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/importar" element={<Importar />} />
          <Route path="/resultados" element={<Resultados />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
