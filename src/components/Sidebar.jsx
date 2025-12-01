import { useEffect, useState } from 'react'
import { getCredentials, getStoredToken } from '../services/xubioAuth'

const tabs = [
  { id: 'presupuestos', label: 'Presupuestos', icon: '📋' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'productos', label: 'Productos', icon: '📦' },
  { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Verificar si hay credenciales locales O token válido (credenciales del servidor)
    const hasCredentials = getCredentials()
    const hasToken = getStoredToken()
    setIsConnected(!!(hasCredentials || hasToken))
  }, [activeTab])

  return (
    <aside className="w-64 bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-xubio-400 to-xubio-300 bg-clip-text text-transparent">
          Xubio
        </h1>
        <p className="text-dark-400 text-sm mt-1">Presupuestos API <span className="text-xubio-500 font-mono">v1.0.6</span></p>
      </div>

      {/* Estado de conexión */}
      <div className="px-6 py-4 border-b border-dark-700/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span className="text-sm text-dark-300">
            {isConnected ? 'Conectado' : 'Sin conexión'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab, index) => (
            <li key={tab.id} className={`animate-slide-in stagger-${index + 1}`} style={{ opacity: 0 }}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-xubio-500/20 text-xubio-300 border border-xubio-500/30'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700/50">
        <p className="text-xs text-dark-500 text-center">
          API v1.1 • InstantDB
        </p>
      </div>
    </aside>
  )
}

