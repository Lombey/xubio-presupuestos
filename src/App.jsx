import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Presupuestos from './pages/Presupuestos'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Configuracion from './pages/Configuracion'

function App() {
  const [activeTab, setActiveTab] = useState('presupuestos')

  const renderPage = () => {
    switch (activeTab) {
      case 'presupuestos':
        return <Presupuestos />
      case 'clientes':
        return <Clientes />
      case 'productos':
        return <Productos />
      case 'configuracion':
        return <Configuracion />
      default:
        return <Presupuestos />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default App

