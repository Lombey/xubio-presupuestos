// Servicios para interactuar con los endpoints de Xubio API
import { authenticatedFetch, getAccessToken } from './xubioAuth'

// ==================== CLIENTES ====================
export const getClientes = async () => {
  return authenticatedFetch('/cliente')
}

export const getCliente = async (id) => {
  return authenticatedFetch(`/cliente/${id}`)
}

// ==================== PRODUCTOS ====================
export const getProductosVenta = async () => {
  return authenticatedFetch('/productoVenta')
}

export const getProductoVenta = async (id) => {
  return authenticatedFetch(`/productoVenta/${id}`)
}

// ==================== PRESUPUESTOS ====================
export const getPresupuestos = async () => {
  return authenticatedFetch('/presupuesto')
}

export const getPresupuesto = async (id) => {
  return authenticatedFetch(`/presupuesto/${id}`)
}

export const createPresupuesto = async (presupuestoData) => {
  return authenticatedFetch('/presupuesto', {
    method: 'POST',
    body: JSON.stringify(presupuestoData)
  })
}

export const updatePresupuesto = async (id, presupuestoData) => {
  return authenticatedFetch(`/presupuesto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(presupuestoData)
  })
}

export const deletePresupuesto = async (id) => {
  return authenticatedFetch(`/presupuesto/${id}`, {
    method: 'DELETE'
  })
}

// ==================== MI EMPRESA ====================
export const getMiEmpresa = async () => {
  return authenticatedFetch('/miempresa')
}

// ==================== CATÁLOGOS ====================
export const getPuntosVenta = async () => {
  return authenticatedFetch('/puntoVenta')
}

export const getMonedas = async () => {
  return authenticatedFetch('/moneda')
}

export const getVendedores = async () => {
  return authenticatedFetch('/vendedor')
}

export const getListasPrecios = async () => {
  return authenticatedFetch('/listaPrecio')
}

export const getDepositos = async () => {
  return authenticatedFetch('/deposito')
}

export const getTasasImpositivas = async () => {
  return authenticatedFetch('/tasaImpositiva')
}

export const getCondicionesPago = () => {
  // Este es un catálogo estático según la documentación
  return [
    { id: 1, nombre: 'Cuenta Corriente' },
    { id: 2, nombre: 'Al Contado' }
  ]
}

// ==================== PDF ====================
export const getPresupuestoPDF = async (id) => {
  const token = await getAccessToken()
  
  const response = await fetch(`https://xubio.com/API/1.1/ImprimirPdf/presupuesto/${id}`, {
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
    fecha: fecha, // formato: YYYY-MM-DD
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

