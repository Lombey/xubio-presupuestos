import { useState } from 'react'
import { useProductos, saveProductos } from '../db/instantdb'
import { getProductosVenta } from '../services/xubioApi'
import { getCredentials } from '../services/xubioAuth'

export default function Productos() {
  const { isLoading, error, data } = useProductos()
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const productos = data?.productos || []
  const isConnected = !!getCredentials()

  const handleSync = async () => {
    if (!isConnected) {
      setSyncMessage('Primero configura las credenciales en la pestaña de Configuración')
      return
    }

    setSyncing(true)
    setSyncMessage('')
    
    try {
      const productosFromApi = await getProductosVenta()
      
      if (Array.isArray(productosFromApi)) {
        await saveProductos(productosFromApi)
        setSyncMessage(`✓ ${productosFromApi.length} productos sincronizados`)
      } else if (productosFromApi) {
        await saveProductos([productosFromApi])
        setSyncMessage('✓ 1 producto sincronizado')
      } else {
        setSyncMessage('No se encontraron productos')
      }
    } catch (err) {
      console.error('Error sincronizando productos:', err)
      setSyncMessage(`Error: ${err.message}`)
    }
    
    setSyncing(false)
  }

  const filteredProductos = productos.filter(producto => {
    const term = searchTerm.toLowerCase()
    return (
      producto.nombre?.toLowerCase().includes(term) ||
      producto.codigo?.toLowerCase().includes(term) ||
      producto.usrcode?.toLowerCase().includes(term) ||
      producto.codigoBarra?.includes(term)
    )
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-dark-400 mt-1">
            {productos.length} productos en caché local
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
          placeholder="Buscar por nombre, código o código de barras..."
          className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-xubio-500 focus:ring-1 focus:ring-xubio-500 transition-colors"
        />
      </div>

      {/* Tabla de productos */}
      {isLoading ? (
        <div className="text-center py-12 text-dark-400">Cargando...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">Error: {error.message}</div>
      ) : filteredProductos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-400 mb-4">
            {productos.length === 0 
              ? 'No hay productos en caché. Sincroniza desde Xubio para cargarlos.'
              : 'No se encontraron productos con ese criterio de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Cód. Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Cód. Barras</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.map((producto, index) => (
                <tr 
                  key={producto.id || index} 
                  className="border-b border-dark-700/30 hover:bg-dark-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-dark-400">
                    {producto.productoid}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-xubio-400">
                    {producto.codigo || '-'}
                  </td>
                  <td className="px-6 py-4 font-medium text-dark-100">
                    {producto.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {producto.usrcode || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-dark-300">
                    {producto.codigoBarra || '-'}
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

