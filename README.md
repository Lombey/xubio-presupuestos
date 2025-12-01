# Xubio Presupuestos App

Aplicación web para gestionar presupuestos a través de la API de Xubio.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL                               │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │   Frontend      │      │   API Routes            │  │
│  │   React/Vite    │ ───► │   (Serverless)          │  │
│  └─────────────────┘      └───────────┬─────────────┘  │
└───────────────────────────────────────┼─────────────────┘
                                        ▼
                            ┌─────────────────────┐
                            │   Xubio API         │
                            │   xubio.com/API/1.1 │
                            └─────────────────────┘
```

## Características

- ✅ Autenticación OAuth2 con API de Xubio
- ✅ Crear y listar presupuestos
- ✅ Descargar presupuestos en PDF
- ✅ Sincronización de clientes y productos
- ✅ Cache local con InstantDB
- ✅ API Routes serverless (sin problemas de CORS)
- ✅ Interfaz moderna con tema oscuro

## Tecnologías

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **Cache**: InstantDB
- **API**: Xubio REST API v1.1

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Instalar Vercel CLI
npm i -g vercel

# Desarrollo local (incluye API Routes)
vercel dev

# Build para producción
npm run build
```

## Deploy en Vercel

### Opción 1: Desde CLI

```bash
# Login en Vercel
vercel login

# Deploy
vercel --prod
```

### Opción 2: Desde GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `xubio-presupuestos`
4. Deploy automático

## Estructura del Proyecto

```
xubio-presupuestos/
├── api/                    # Vercel Serverless Functions
│   ├── auth.js             # POST /api/auth
│   ├── empresa.js          # GET /api/empresa
│   ├── clientes.js         # GET /api/clientes
│   ├── productos.js        # GET /api/productos
│   ├── presupuestos.js     # GET/POST /api/presupuestos
│   ├── presupuestos/[id].js # GET/DELETE /api/presupuestos/:id
│   └── pdf/[id].js         # GET /api/pdf/:id
├── src/                    # Frontend React
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── db/
├── vercel.json
└── package.json
```

## API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth` | POST | Autenticar y obtener token |
| `/api/empresa` | GET | Datos de la empresa |
| `/api/clientes` | GET | Lista de clientes |
| `/api/productos` | GET | Lista de productos |
| `/api/presupuestos` | GET | Lista de presupuestos |
| `/api/presupuestos` | POST | Crear presupuesto |
| `/api/presupuestos/:id` | DELETE | Eliminar presupuesto |
| `/api/pdf/:id` | GET | Descargar PDF |

## Uso

1. Abre la app en tu navegador
2. Ve a **Configuración**
3. Ingresa tu `Client ID` y `Secret ID` de Xubio
4. **Guardar y Conectar**
5. Sincroniza clientes y productos
6. ¡Crea presupuestos!

## API de Xubio

Documentación: https://main.xubio.com/API/documentation/index.html

## Licencia

MIT
