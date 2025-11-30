// Servicio de autenticación OAuth2 para Xubio API

// Proxy CORS para evitar bloqueos del navegador
// Opciones: 'direct' (sin proxy), 'corsproxy', 'allorigins'
const CORS_PROXY_MODE = 'corsproxy'

const CORS_PROXIES = {
  direct: '',
  corsproxy: 'https://corsproxy.io/?',
  allorigins: 'https://api.allorigins.win/raw?url='
}

const getProxiedUrl = (url) => {
  const proxy = CORS_PROXIES[CORS_PROXY_MODE] || ''
  if (!proxy) return url
  // corsproxy.io no necesita encoding, solo concatenar la URL
  if (CORS_PROXY_MODE === 'corsproxy') {
    return `${proxy}${url}`
  }
  return `${proxy}${encodeURIComponent(url)}`
}

const BASE_URL = 'https://xubio.com'
const API_BASE = `${BASE_URL}/API/1.1`
// Probar diferentes endpoints de login
const TOKEN_URL = `${API_BASE}/login`

// Exportar para uso en otros módulos
export { getProxiedUrl, API_BASE }

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

// Obtener nuevo access_token
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
    const response = await fetch(getProxiedUrl(TOKEN_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': credentials.clientId,
        'client_secret': credentials.secretId,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error de autenticación: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // Guardar el token con tiempo de expiración
    const expiresIn = data.expires_in || 3600 // Default 1 hora
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
    const response = await fetch(getProxiedUrl(`${API_BASE}/miempresa`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, empresa: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper para hacer peticiones autenticadas
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = await getAccessToken()
  
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const response = await fetch(getProxiedUrl(`${API_BASE}${endpoint}`), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }

  // Algunos endpoints pueden devolver vacío
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

