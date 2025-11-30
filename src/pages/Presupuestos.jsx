import { useState, useEffect } from 'react'
import { useClientes, useProductos } from '../db/instantdb'
import { getPresupuestos, createPresupuesto, deletePresupuesto, getPresupuestoPDF, buildPresupuestoBean } from '../services/xubioApi'
import { getCredentials } from '../services/xubioAuth'

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Datos de InstantDB para selects
  const { data: clientesData } = useClientes()
  const { data: productosData } = useProductos()
  
  const clientes = clientesData?.clientes || []
  const productos = productosData?.productos || []
  const isConnected = !!getCredentials()

  // Form state
  const [formData, setFormData] = useState({
    clienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    fechaVto: '',
    descripcion: '',
    condicionDePago: 2,
    items: []
  })

  // Item temporal para agregar
  const [newItem, setNewItem] = useState({
    productoId: '',
    cantidad: 1,
    precioUnitario: 0,
    descripcion: ''
  })

  useEffect(() => {
    if (isConnected) {
      loadPresupuestos()
    }
  }, [isConnected])

  const loadPresupuestos = async () => {
    setLoading(true)
    try {
      const data = await getPresupuestos()
      setPresupuestos(Array.isArray(data) ? data : data ? [data] : [])
    } catch (err) {
      console.error('Error cargando presupuestos:', err)
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    }
    setLoading(false)
  }

  const handleAddItem = () => {
    if (!newItem.productoId || newItem.cantidad <= 0) {
      setMessage({ type: 'error', text: 'Selecciona un producto y cantidad válida' })
      return
    }
    
    const producto = productos.find(p => p.productoid == newItem.productoId)
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        ...newItem,
        productoNombre: producto?.nombre || 'Producto'
      }]
    }))
    setNewItem({ productoId: '', cantidad: 1, precioUnitario: 0, descripcion: '' })
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clienteId) {
      setMessage({ type: 'error', text: 'Selecciona un cliente' })
      return
    }
    
    if (formData.items.length === 0) {
      setMessage({ type: 'error', text: 'Agrega al menos un item' })
      return
    }

    setLoading(true)
    try {
      const presupuestoBean = buildPresupuestoBean({
        clienteId: parseInt(formData.clienteId),
        fecha: formData.fecha,
        fechaVto: formData.fechaVto || formData.fecha,
        descripcion: formData.descripcion,
        condicionDePago: parseInt(formData.condicionDePago),
        items: formData.items.map(item => ({
          productoId: parseInt(item.productoId),
          cantidad: parseFloat(item.cantidad),
          precioUnitario: parseFloat(item.precioUnitario),
          descripcion: item.descripcion
        }))
      })

      await createPresupuesto(presupuestoBean)
      setMessage({ type: 'success', text: '¡Presupuesto creado exitosamente!' })
      setShowForm(false)
      setFormData({
        clienteId: '',
        fecha: new Date().toISOString().split('T')[0],
        fechaVto: '',
        descripcion: '',
        condicionDePago: 2,
        items: []
      })
      loadPresupuestos()
    } catch (err) {
      console.error('Error creando presupuesto:', err)
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    }
    setLoading(false)
  }

  const handleDownloadPDF = async (id) => {
    try {
      const blob = await getPresupuestoPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `presupuesto-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error descargando PDF:', err)
      setMessage({ type: 'error', text: `Error descargando PDF: ${err.message}` })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return
    
    try {
      await deletePresupuesto(id)
      setMessage({ type: 'success', text: 'Presupuesto eliminado' })
      loadPresupuestos()
    } catch (err) {
      console.error('Error eliminando presupuesto:', err)
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    }
  }

  const calcularTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.cantidad * item.precioUnitario)
    }, 0)
  }

  if (!isConnected) {
    return (
      <div className="animate-fade-in text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Presupuestos</h1>
        <p className="text-dark-400 mb-6">
          Configura las credenciales de la API en la pestaña de Configuración para comenzar.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-dark-400 mt-1">
            {presupuestos.length} presupuestos en Xubio
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadPresupuestos}
            disabled={loading}
            className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-dark-200 font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span>
            Actualizar
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-xubio-600 hover:bg-xubio-500 text-white font-medium rounded-xl transition-all flex items-center gap-2"
          >
            {showForm ? '✕ Cerrar' : '+ Nuevo Presupuesto'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulario de nuevo presupuesto */}
      {showForm && (
        <div className="mb-8 bg-dark-800/50 rounded-xl border border-dark-700/50 p-6">
          <h2 className="text-xl font-semibold mb-6">Nuevo Presupuesto</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-xubio-500"
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.clienteid}>
                      {cliente.nombre || cliente.razonSocial} {cliente.cuit ? `(${cliente.cuit})` : ''}
                    </option>
                  ))}
                </select>
                {clientes.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    Sincroniza clientes primero en la pestaña Clientes
                  </p>
                )}
              </div>

              {/* Condición de pago */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Condición de Pago
                </label>
                <select
                  value={formData.condicionDePago}
                  onChange={(e) => setFormData(prev => ({ ...prev, condicionDePago: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-xubio-500"
                >
                  <option value={2}>Al Contado</option>
                  <option value={1}>Cuenta Corriente</option>
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-xubio-500"
                />
              </div>

              {/* Fecha Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Fecha Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaVto}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaVto: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-xubio-500"
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del presupuesto..."
                  rows={2}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-xubio-500 resize-none"
                />
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Items del Presupuesto</h3>
              
              {/* Agregar item */}
              <div className="grid grid-cols-5 gap-3 mb-4 p-4 bg-dark-900/50 rounded-lg">
                <div className="col-span-2">
                  <select
                    value={newItem.productoId}
                    onChange={(e) => setNewItem(prev => ({ ...prev, productoId: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-sm focus:outline-none focus:border-xubio-500"
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.productoid}>
                        {producto.codigo ? `[${producto.codigo}] ` : ''}{producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  value={newItem.cantidad}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cantidad: e.target.value }))}
                  placeholder="Cantidad"
                  min="0.01"
                  step="0.01"
                  className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-sm focus:outline-none focus:border-xubio-500"
                />
                <input
                  type="number"
                  value={newItem.precioUnitario}
                  onChange={(e) => setNewItem(prev => ({ ...prev, precioUnitario: e.target.value }))}
                  placeholder="Precio unit."
                  min="0"
                  step="0.01"
                  className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-sm focus:outline-none focus:border-xubio-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-xubio-600 hover:bg-xubio-500 text-white rounded-lg text-sm transition-colors"
                >
                  + Agregar
                </button>
              </div>

              {productos.length === 0 && (
                <p className="text-xs text-amber-400 mb-4">
                  Sincroniza productos primero en la pestaña Productos
                </p>
              )}

              {/* Lista de items */}
              {formData.items.length > 0 ? (
                <div className="border border-dark-700/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-dark-300">Producto</th>
                        <th className="px-4 py-3 text-right text-dark-300">Cantidad</th>
                        <th className="px-4 py-3 text-right text-dark-300">Precio Unit.</th>
                        <th className="px-4 py-3 text-right text-dark-300">Subtotal</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-t border-dark-700/30">
                          <td className="px-4 py-3 text-dark-100">{item.productoNombre}</td>
                          <td className="px-4 py-3 text-right text-dark-300">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-dark-300">${item.precioUnitario}</td>
                          <td className="px-4 py-3 text-right text-dark-100 font-medium">
                            ${(item.cantidad * item.precioUnitario).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-dark-600 bg-dark-800/30">
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold text-dark-200">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-xubio-400 text-lg">
                          ${calcularTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-dark-500 py-4">
                  No hay items agregados
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-xubio-600 hover:bg-xubio-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Presupuesto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de presupuestos */}
      {loading && presupuestos.length === 0 ? (
        <div className="text-center py-12 text-dark-400">Cargando presupuestos...</div>
      ) : presupuestos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-400">No hay presupuestos. Crea uno nuevo para comenzar.</p>
        </div>
      ) : (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Número</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-300">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-dark-300">Total</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-dark-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.map((presupuesto, index) => (
                <tr 
                  key={presupuesto.transaccionId || index} 
                  className="border-b border-dark-700/30 hover:bg-dark-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-dark-400">
                    {presupuesto.transaccionId}
                  </td>
                  <td className="px-6 py-4 font-medium text-xubio-400">
                    {presupuesto.numeroDocumento || '-'}
                  </td>
                  <td className="px-6 py-4 text-dark-100">
                    {presupuesto.cliente?.nombre || presupuesto.cliente?.razonSocial || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {presupuesto.fecha || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-dark-100">
                    ${presupuesto.importetotal?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDownloadPDF(presupuesto.transaccionId)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
                        title="Descargar PDF"
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => handleDelete(presupuesto.transaccionId)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
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

