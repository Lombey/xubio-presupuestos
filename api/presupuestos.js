// API Route: Presupuestos
// GET /api/presupuestos - Listar presupuestos
// POST /api/presupuestos - Crear presupuesto

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  try {
    // GET - Listar presupuestos
    if (req.method === 'GET') {
      const response = await fetch(`${XUBIO_API}/presupuesto`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return res.status(response.status).json({ 
          error: 'Error obteniendo presupuestos',
          details: errorText 
        })
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    // POST - Crear presupuesto
    if (req.method === 'POST') {
      const response = await fetch(`${XUBIO_API}/presupuesto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        return res.status(response.status).json({ 
          error: 'Error creando presupuesto',
          details: errorText 
        })
      }

      const data = await response.json()
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error en /api/presupuestos:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

