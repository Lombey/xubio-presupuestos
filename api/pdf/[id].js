// API Route: Descargar PDF de presupuesto
// GET /api/pdf/:id

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  if (!id) {
    return res.status(400).json({ error: 'ID no proporcionado' })
  }

  try {
    const response = await fetch(`${XUBIO_API}/ImprimirPdf/presupuesto/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ 
        error: 'Error descargando PDF',
        details: errorText 
      })
    }

    // Obtener el PDF como buffer
    const pdfBuffer = await response.arrayBuffer()

    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`)
    
    return res.send(Buffer.from(pdfBuffer))

  } catch (error) {
    console.error('Error en /api/pdf/[id]:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

