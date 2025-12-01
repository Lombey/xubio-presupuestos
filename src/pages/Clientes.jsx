import { useState } from 'react'
import { useClientes, saveClientes } from '../db/instantdb'
import { getClientes } from '../services/xubioApi'
import { getCredentials, getStoredToken } from '../services/xubioAuth'

export default function Clientes() {
  const { isLoading, error, data } = useClientes()
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const clientes = data?.clientes || []
  // Verificar si hay credenciales locales O un token válido (credenciales del servidor)
  const isConnected = !!(getCredentials() || getStoredToken())

  const handleSync = async () => {
    if (!isConnected) {
      setSyncMessage('Primero configura las credenciales en la pestaña de Configuración')
      return
    }

    setSyncing(true)
    setSyncMessage('')
    
    try {
      const clientesFromApi = await getClientes()
      
      if (Array.isArray(clientesFromApi)) {
        await saveClientes(clientesFromApi)
        setSyncMessage(`✓ ${clientesFromApi.length} clientes sincronizados`)
      } else if (clientesFromApi) {
        // A veces la API devuelve un objeto único
        await saveClientes([clientesFromApi])
        setSyncMessage('✓ 1 cliente sincronizado')
      } else {
        setSyncMessage('No se encontraron clientes')
      }
    } catch (err) {
      console.error('Error sincronizando clientes:', err)
      setSyncMessage(`Error: ${err.message}`)
    }
    
    setSyncing(false)
  }

  const filteredClientes = clientes.filter(cliente => {
    const term = searchTerm.toLowerCase()
    return (
      cliente.nombre?.toLowerCase().includes(term) ||
      cliente.razonSocial?.toLowerCase().includes(term) ||
      cliente.cuit?.includes(term) ||
      cliente.email?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-dark-400 mt-1">
            {clientes.length} clientes en caché local
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || !isConnected}
          className="px-6 py-3 bg-xubio-600 hover:bg-xubio-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <span className="animate-spin">⟳</span>
              Sincronizando...
            </>
          ) : (
            <>
              <span>↻</span>
              Sincronizar desde Xubio
            </>
          )}
        </button>
      </div>

      {syncMessage && (
        <div className={`mb-6 p-4 rounded-xl ${
          syncMessage.startsWith('✓') 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : syncMessage.startsWith('Error')
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, razón social, CUIT o email..."
          className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-xubio-500 focus:ring-1 focus:ring-xubio-500 transition-colors"
        />
      </div>

      {/* Tabla de clientes */}
      {isLoading ? (
        <div className="text-center py-12 text-dark-400">Cargando...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">Error: {error.message}</div>
      ) : filteredClientes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-400 mb-4">
            {clientes.length === 0 
              ? 'No hay clientes en caché. Sincroniza desde Xubio para cargarlos.'
              : 'No se encontraron clientes con ese criterio de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Nombre / Razón Social</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">CUIT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente, index) => (
                <tr 
                  key={cliente.id || index} 
                  className="border-b border-dark-700/30 hover:bg-dark-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-dark-400">
                    {cliente.clienteid}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-dark-100">
                      {cliente.nombre || cliente.razonSocial || '-'}
                    </div>
                    {cliente.razonSocial && cliente.nombre !== cliente.razonSocial && (
                      <div className="text-sm text-dark-400">{cliente.razonSocial}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-dark-300">
                    {cliente.cuit || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {cliente.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {cliente.telefono || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

