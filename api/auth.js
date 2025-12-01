// API Route: Autenticación con Xubio
// POST /api/auth - Obtiene token de acceso
// GET /api/auth - Verifica si hay credenciales del servidor

const XUBIO_API = 'https://xubio.com/API/1.1'

// Credenciales del servidor (variables de entorno de Vercel)
const SERVER_CLIENT_ID = process.env.XUBIO_CLIENT_ID
const SERVER_SECRET_ID = process.env.XUBIO_SECRET_ID

export default async function handler(req, res) {
  // GET - Verificar si hay credenciales del servidor
  if (req.method === 'GET') {
    return res.status(200).json({ 
      hasServerCredentials: !!(SERVER_CLIENT_ID && SERVER_SECRET_ID)
    })
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Usar credenciales del servidor si existen, sino las del body
    const { clientId: bodyClientId, secretId: bodySecretId, useServerCredentials } = req.body
    
    let clientId, secretId
    
    if (useServerCredentials && SERVER_CLIENT_ID && SERVER_SECRET_ID) {
      clientId = SERVER_CLIENT_ID
      secretId = SERVER_SECRET_ID
    } else {
      clientId = bodyClientId
      secretId = bodySecretId
    }

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

