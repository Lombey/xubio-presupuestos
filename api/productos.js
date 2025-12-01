// API Route: Productos de Venta
// GET /api/productos

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  // Probar con productoVentaBean (como clientes usa clienteBean)
  const endpoint = `${XUBIO_API}/productoVentaBean`
  
  let response
  try {
    response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (fetchError) {
    return res.status(500).json({ 
      error: 'Error en fetch',
      message: fetchError.message,
      endpoint: endpoint
    })
  }

  // Si productoVentaBean falla con 404, probar productoVenta
  if (response.status === 404) {
    try {
      response = await fetch(`${XUBIO_API}/productoVenta`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (fetchError) {
      return res.status(500).json({ 
        error: 'Error en fetch (fallback)',
        message: fetchError.message
      })
    }
  }

  if (!response.ok) {
    let errorText = ''
    try {
      errorText = await response.text()
    } catch (e) {
      errorText = 'No se pudo leer el error'
    }
    return res.status(response.status).json({ 
      error: 'Error obteniendo productos',
      status: response.status,
      statusText: response.statusText,
      details: errorText
    })
  }

  let data
  try {
    data = await response.json()
  } catch (jsonError) {
    return res.status(500).json({ 
      error: 'Error parseando JSON',
      message: jsonError.message
    })
  }

  return res.status(200).json(data)
}

