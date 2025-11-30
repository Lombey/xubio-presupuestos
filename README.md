# Xubio Presupuestos App

Aplicación web simple para gestionar presupuestos a través de la API de Xubio.

## Características

- ✅ Autenticación OAuth2 con API de Xubio
- ✅ Crear y listar presupuestos
- ✅ Descargar presupuestos en PDF
- ✅ Sincronización de clientes y productos
- ✅ Cache local con InstantDB
- ✅ Interfaz moderna con tema oscuro

## Tecnologías

- **React** + Vite
- **TailwindCSS** para estilos
- **InstantDB** para cache local en tiempo real
- **Xubio API v1.1** para operaciones de presupuestos

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## Configuración

1. Abre la aplicación en tu navegador
2. Ve a la pestaña **Configuración**
3. Ingresa tu `Client ID` y `Secret ID` de Xubio
4. Haz clic en "Guardar y Conectar"

## Uso

1. **Configuración**: Primero configura las credenciales de la API
2. **Clientes**: Sincroniza los clientes desde Xubio
3. **Productos**: Sincroniza los productos de venta desde Xubio
4. **Presupuestos**: Crea, lista y descarga presupuestos

## API de Xubio

Esta aplicación utiliza los siguientes endpoints de la API de Xubio v1.1:

- `POST /API/Login` - Autenticación OAuth2
- `GET /miempresa` - Datos de la empresa
- `GET /cliente` - Listado de clientes
- `GET /productoVenta` - Listado de productos
- `GET/POST /presupuesto` - CRUD de presupuestos
- `GET /ImprimirPdf/presupuesto/{id}` - Descargar PDF

Documentación completa: https://main.xubio.com/API/documentation/index.html

## Deploy en GitHub Pages

```bash
# Build
npm run build

# El directorio `dist` contiene los archivos para deploy
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes UI reutilizables
├── pages/          # Páginas principales
├── services/       # Servicios para API de Xubio
├── db/             # Configuración de InstantDB
└── api/            # swagger.json de referencia
```

## Licencia

MIT

