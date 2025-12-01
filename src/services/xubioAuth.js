// Servicio de autenticación - Usa API Routes de Vercel
// Ya no necesitamos proxy CORS porque las llamadas van al mismo dominio

// Obtener credenciales del localStorage
export const getCredentials = () => {
  const stored = localStorage.getItem('xubio_credentials')
  if (stored) {
    return JSON.parse(stored)
  }
  return null
}

// Guardar credenciales
export const saveCredentials = (clientId, secretId) => {
  localStorage.setItem('xubio_credentials', JSON.stringify({
    clientId,
    secretId,
    savedAt: new Date().toISOString()
  }))
}

// Eliminar credenciales
export const clearCredentials = () => {
  localStorage.removeItem('xubio_credentials')
  localStorage.removeItem('xubio_token')
}

// Obtener token almacenado
export const getStoredToken = () => {
  const stored = localStorage.getItem('xubio_token')
  if (stored) {
    const tokenData = JSON.parse(stored)
    // Verificar si el token no ha expirado (con margen de 5 minutos)
    const expiresAt = new Date(tokenData.expiresAt)
    const now = new Date()
    if (expiresAt > now) {
      return tokenData.accessToken
    }
  }
  return null
}

// Obtener nuevo access_token via API Route
export const getAccessToken = async () => {
  // Primero verificar si hay un token válido almacenado
  const storedToken = getStoredToken()
  if (storedToken) {
    return storedToken
  }

  const credentials = getCredentials()
  if (!credentials) {
    throw new Error('No hay credenciales configuradas')
  }

  try {
    // Llamar a nuestra API Route (mismo dominio = sin CORS)
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: credentials.clientId,
        secretId: credentials.secretId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error de autenticación: ${response.status}`)
    }

    const data = await response.json()
    
    // Guardar el token con tiempo de expiración
    const expiresIn = data.expires_in || 3600
    const expiresAt = new Date(Date.now() + (expiresIn * 1000))
    
    localStorage.setItem('xubio_token', JSON.stringify({
      accessToken: data.access_token,
      expiresAt: expiresAt.toISOString(),
      tokenType: data.token_type || 'Bearer'
    }))

    return data.access_token
  } catch (error) {
    console.error('Error obteniendo access token:', error)
    throw error
  }
}

// Verificar conexión con la API
export const testConnection = async () => {
  try {
    const token = await getAccessToken()
    const response = await fetch('/api/empresa', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, empresa: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper para hacer peticiones autenticadas a nuestras API Routes
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = await getAccessToken()
  
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API Error ${response.status}`)
  }

  // Algunos endpoints pueden devolver vacío
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
