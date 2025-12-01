// Servicios para interactuar con la API de Xubio via API Routes locales
import { authenticatedFetch, getAccessToken } from './xubioAuth'

// ==================== CLIENTES ====================
export const getClientes = async () => {
  return authenticatedFetch('/api/clientes')
}

// ==================== PRODUCTOS ====================
export const getProductosVenta = async () => {
  return authenticatedFetch('/api/productos')
}

// ==================== PRESUPUESTOS ====================
export const getPresupuestos = async () => {
  return authenticatedFetch('/api/presupuestos')
}

export const getPresupuesto = async (id) => {
  return authenticatedFetch(`/api/presupuestos/${id}`)
}

export const createPresupuesto = async (presupuestoData) => {
  return authenticatedFetch('/api/presupuestos', {
    method: 'POST',
    body: JSON.stringify(presupuestoData)
  })
}

export const deletePresupuesto = async (id) => {
  return authenticatedFetch(`/api/presupuestos/${id}`, {
    method: 'DELETE'
  })
}

// ==================== MI EMPRESA ====================
export const getMiEmpresa = async () => {
  return authenticatedFetch('/api/empresa')
}

// ==================== PDF ====================
export const getPresupuestoPDF = async (id) => {
  const token = await getAccessToken()
  
  const response = await fetch(`/api/pdf/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`Error descargando PDF: ${response.status}`)
  }
  
  return response.blob()
}

// ==================== HELPERS ====================
// Construir objeto PresupuestoBean para crear presupuesto
export const buildPresupuestoBean = ({
  clienteId,
  fecha,
  fechaVto,
  descripcion,
  puntoVentaId,
  monedaId,
  condicionDePago = 2,
  items = []
}) => {
  return {
    cliente: { clienteid: clienteId },
    fecha: fecha,
    fechaVto: fechaVto,
    descripcion: descripcion || '',
    puntoVenta: puntoVentaId ? { puntoVentaId: puntoVentaId } : undefined,
    moneda: monedaId ? { ID: monedaId } : undefined,
    condicionDePago: condicionDePago,
    transaccionProductoItems: items.map(item => ({
      productoVenta: { productoid: item.productoId },
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      bonificacion: item.bonificacion || 0,
      descripcion: item.descripcion || ''
    }))
  }
}

// Condiciones de pago (catálogo estático)
export const getCondicionesPago = () => {
  return [
    { id: 1, nombre: 'Cuenta Corriente' },
    { id: 2, nombre: 'Al Contado' }
  ]
}
