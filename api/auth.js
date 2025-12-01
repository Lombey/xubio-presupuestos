// API Route: Autenticación con Xubio
// POST /api/auth - Obtiene token de acceso

const XUBIO_API = 'https://xubio.com/API/1.1'

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { clientId, secretId } = req.body

    if (!clientId || !secretId) {
      return res.status(400).json({ error: 'clientId y secretId son requeridos' })
    }

    // Basic Auth según documentación de Xubio
    const basicAuth = Buffer.from(`${clientId}:${secretId}`).toString('base64')

    const response = await fetch(`${XUBIO_API}/TokenEndpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ 
        error: 'Error de autenticación',
        details: errorText 
      })
    }

    const data = await response.json()
    
    // Devolver token al cliente
    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600
    })

  } catch (error) {
    console.error('Error en /api/auth:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

