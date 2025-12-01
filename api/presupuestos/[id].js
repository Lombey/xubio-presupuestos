// API Route: Presupuesto por ID
// GET /api/presupuestos/:id - Obtener presupuesto
// DELETE /api/presupuestos/:id - Eliminar presupuesto

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  const { id } = req.query
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  if (!id) {
    return res.status(400).json({ error: 'ID no proporcionado' })
  }

  try {
    // GET - Obtener presupuesto específico
    if (req.method === 'GET') {
      const response = await fetch(`${XUBIO_API}/presupuesto/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return res.status(response.status).json({ 
          error: 'Error obteniendo presupuesto',
          details: errorText 
        })
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    // DELETE - Eliminar presupuesto
    if (req.method === 'DELETE') {
      const response = await fetch(`${XUBIO_API}/presupuesto/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        return res.status(response.status).json({ 
          error: 'Error eliminando presupuesto',
          details: errorText 
        })
      }

      return res.status(200).json({ success: true, message: 'Presupuesto eliminado' })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error en /api/presupuestos/[id]:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

