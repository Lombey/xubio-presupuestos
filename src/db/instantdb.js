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
  const txs = clientes.map(cliente => 
    db.tx.clientes[cliente.clienteid || db.id()].update({
      clienteid: cliente.clienteid,
      nombre: cliente.nombre || cliente.razonSocial || '',
      razonSocial: cliente.razonSocial || '',
      cuit: cliente.cuit || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      syncedAt: new Date().toISOString()
    })
  )
  return db.transact(txs)
}

export const saveProductos = async (productos) => {
  const txs = productos.map(producto => 
    db.tx.productos[producto.productoid || db.id()].update({
      productoid: producto.productoid,
      nombre: producto.nombre || '',
      codigo: producto.codigo || '',
      usrcode: producto.usrcode || '',
      codigoBarra: producto.codigoBarra || '',
      syncedAt: new Date().toISOString()
    })
  )
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

