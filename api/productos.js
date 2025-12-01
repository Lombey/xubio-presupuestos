// API Route: Productos de Venta
// GET /api/productos
// Usa /productoVenta (sin Bean) según swagger oficial

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    // Usar /ProductoVentaBean (con P mayúscula según documentación Xubio)
    const response = await fetch(`${XUBIO_API}/ProductoVentaBean`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ 
        error: 'Error obteniendo productos',
        details: errorText 
      })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (error) {
    console.error('Error en /api/productos:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

