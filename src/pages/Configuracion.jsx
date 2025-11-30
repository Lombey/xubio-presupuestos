import { useState, useEffect } from 'react'
import { getCredentials, saveCredentials, clearCredentials, testConnection } from '../services/xubioAuth'
import { clearAllData } from '../db/instantdb'

export default function Configuracion() {
  const [clientId, setClientId] = useState('')
  const [secretId, setSecretId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    // Cargar credenciales guardadas
    const credentials = getCredentials()
    if (credentials) {
      setClientId(credentials.clientId)
      setSecretId(credentials.secretId)
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    setLoading(true)
    const result = await testConnection()
    setIsConnected(result.success)
    if (result.success) {
      setEmpresa(result.empresa)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!clientId || !secretId) {
      setMessage({ type: 'error', text: 'Por favor ingresa ambas credenciales' })
      return
    }

    setLoading(true)
    saveCredentials(clientId, secretId)
    
    const result = await testConnection()
    if (result.success) {
      setIsConnected(true)
      setEmpresa(result.empresa)
      setMessage({ type: 'success', text: '¡Conexión exitosa! Credenciales guardadas.' })
    } else {
      setMessage({ type: 'error', text: `Error de conexión: ${result.error}` })
    }
    setLoading(false)
  }

  const handleClear = async () => {
    clearCredentials()
    await clearAllData()
    setClientId('')
    setSecretId('')
    setIsConnected(false)
    setEmpresa(null)
    setMessage({ type: 'info', text: 'Credenciales y datos eliminados' })
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-dark-400 mb-8">Configura las credenciales de la API de Xubio</p>

      {/* Estado de conexión */}
      <div className={`mb-8 p-4 rounded-xl border ${
        isConnected 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-dark-800/50 border-dark-700/50'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'
          }`}></span>
          <span className={isConnected ? 'text-emerald-300' : 'text-dark-400'}>
            {isConnected ? 'Conectado a Xubio API' : 'No conectado'}
          </span>
        </div>
        {empresa && (
          <div className="mt-3 pl-6 text-sm text-dark-300">
            <p><strong>Empresa:</strong> {empresa.razonSocial || empresa.nombre}</p>
            {empresa.cuit && <p><strong>CUIT:</strong> {empresa.cuit}</p>}
          </div>
        )}
      </div>

      {/* Formulario de credenciales */}
      <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700/50">
        <h2 className="text-lg font-semibold mb-4 text-dark-200">Credenciales OAuth2</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Tu client-id de Xubio"
              className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-xubio-500 focus:ring-1 focus:ring-xubio-500 transition-colors font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Secret ID
            </label>
            <input
              type="password"
              value={secretId}
              onChange={(e) => setSecretId(e.target.value)}
              placeholder="Tu secret-id de Xubio"
              className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-xubio-500 focus:ring-1 focus:ring-xubio-500 transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {/* Mensaje */}
        {message.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
            message.type === 'error' ? 'bg-red-500/20 text-red-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-xubio-600 hover:bg-xubio-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Conectando...' : 'Guardar y Conectar'}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-dark-200 font-medium rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-dark-800/30 rounded-xl border border-dark-700/30">
        <h3 className="text-sm font-semibold text-dark-300 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-dark-400 space-y-1">
          <li>• Las credenciales se guardan localmente en tu navegador</li>
          <li>• Puedes obtener tus credenciales en el portal de desarrolladores de Xubio</li>
          <li>• La API utiliza autenticación OAuth2 con client_credentials</li>
        </ul>
      </div>
    </div>
  )
}

