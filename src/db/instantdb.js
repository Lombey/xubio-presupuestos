import { init } from '@instantdb/react'

const APP_ID = '4a6ce7cc-945e-49f1-acac-918ef071770c'

export const db = init({ appId: APP_ID })

// Helpers para trabajar con InstantDB
export const useClientes = () => {
  return db.useQuery({ clientes: {} })
}

export const useProductos = () => {
  return db.useQuery({ productos: {} })
}

export const usePuntosVenta = () => {
  return db.useQuery({ puntosVenta: {} })
}

export const useMonedas = () => {
  return db.useQuery({ monedas: {} })
}

export const usePresupuestosLocales = () => {
  return db.useQuery({ presupuestosLocales: {} })
}

// Funciones para guardar datos
export const saveClientes = async (clientes) => {
  // Filtrar clientes sin ID válido
  const validClientes = clientes.filter(c => c && (c.clienteid || c.ID || c.id))
  
  // Primero, obtener clientes existentes para evitar duplicados
  const { clientes: existingClientes } = await db.queryOnce({ clientes: {} })
  const existingMap = new Map((existingClientes || []).map(c => [c.clienteid, c.id]))
  
  const txs = validClientes.map(cliente => {
    // Xubio puede usar clienteid, ID, o id
    const clienteId = cliente.clienteid || cliente.ID || cliente.id
    
    // Usar ID existente si ya existe, sino generar nuevo UUID
    const instantId = existingMap.get(clienteId) || db.id()
    
    return db.tx.clientes[instantId].update({
      clienteid: clienteId,
      nombre: cliente.nombre || cliente.razonSocial || '',
      razonSocial: cliente.razonSocial || '',
      cuit: cliente.cuit || cliente.CUIT || '',
      email: cliente.email || cliente.Email || '',
      telefono: cliente.telefono || cliente.Telefono || '',
      direccion: cliente.direccion || cliente.Direccion || '',
      syncedAt: new Date().toISOString()
    })
  })
  
  if (txs.length === 0) {
    console.warn('No se encontraron clientes válidos para guardar')
    return
  }
  
  return db.transact(txs)
}

export const saveProductos = async (productos) => {
  // Filtrar productos sin ID válido
  const validProductos = productos.filter(p => p && (p.productoid || p.ID || p.id))
  
  // Primero, obtener productos existentes para evitar duplicados
  const { productos: existingProductos } = await db.queryOnce({ productos: {} })
  const existingMap = new Map((existingProductos || []).map(p => [p.productoid, p.id]))
  
  const txs = validProductos.map(producto => {
    // Xubio puede usar productoid, ID, o id
    const productoId = producto.productoid || producto.ID || producto.id
    
    // Usar ID existente si ya existe, sino generar nuevo UUID
    const instantId = existingMap.get(productoId) || db.id()
    
    return db.tx.productos[instantId].update({
      productoid: productoId,
      nombre: producto.nombre || '',
      codigo: producto.codigo || '',
      usrcode: producto.usrcode || '',
      codigoBarra: producto.codigoBarra || '',
      precioUltCompra: producto.precioUltCompra || 0,
      activo: producto.activo || 0,
      syncedAt: new Date().toISOString()
    })
  })
  
  if (txs.length === 0) {
    console.warn('No se encontraron productos válidos para guardar')
    return
  }
  
  return db.transact(txs)
}

export const savePuntosVenta = async (puntosVenta) => {
  const txs = puntosVenta.map(pv => 
    db.tx.puntosVenta[pv.puntoVentaId || db.id()].update({
      puntoVentaId: pv.puntoVentaId,
      nombre: pv.nombre || '',
      codigo: pv.codigo || '',
      puntoVenta: pv.puntoVenta || '',
      syncedAt: new Date().toISOString()
    })
  )
  return db.transact(txs)
}

export const saveMonedas = async (monedas) => {
  const txs = monedas.map(moneda => 
    db.tx.monedas[moneda.ID || db.id()].update({
      monedaId: moneda.ID,
      nombre: moneda.nombre || '',
      codigo: moneda.codigo || '',
      simbolo: moneda.simbolo || '',
      syncedAt: new Date().toISOString()
    })
  )
  return db.transact(txs)
}

export const savePresupuestoLocal = async (presupuesto) => {
  const id = presupuesto.transaccionId || db.id()
  return db.transact([
    db.tx.presupuestosLocales[id].update({
      ...presupuesto,
      savedAt: new Date().toISOString()
    })
  ])
}

export const deletePresupuestoLocal = async (id) => {
  return db.transact([
    db.tx.presupuestosLocales[id].delete()
  ])
}

// Limpiar todas las entidades
export const clearAllData = async () => {
  // Esto elimina todos los datos locales
  const { clientes } = await db.queryOnce({ clientes: {} })
  const { productos } = await db.queryOnce({ productos: {} })
  const { puntosVenta } = await db.queryOnce({ puntosVenta: {} })
  const { monedas } = await db.queryOnce({ monedas: {} })
  
  const txs = [
    ...(clientes || []).map(c => db.tx.clientes[c.id].delete()),
    ...(productos || []).map(p => db.tx.productos[p.id].delete()),
    ...(puntosVenta || []).map(pv => db.tx.puntosVenta[pv.id].delete()),
    ...(monedas || []).map(m => db.tx.monedas[m.id].delete()),
  ]
  
  if (txs.length > 0) {
    return db.transact(txs)
  }
}

