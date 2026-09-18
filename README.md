# Chequea - Consulta de Precios y Catálogo

Plataforma inteligente para la consulta y sincronización de precios e inventario en tiempo real.

## Características

- 🔍 **Buscador de Precios en Vivo**: Consulta rápida de repuestos y productos con actualización dinámica.
- ⚡ **Sincronización con Valery ERP**: Conexión y escaneo automático con bases de datos Firebird SQL (`DATOS.FDB`).
- 🟣 **Integración con Odoo ERP**: Conexión mediante API JSON-RPC (puerto 8069) para sincronizar modelos de productos (`product.template`).
- ✍️ **Gestión Manual (CRUD)**: Creación, lectura, edición y eliminación de productos de forma manual.
- 🌓 **Modos Claro y Oscuro**: Interfaz reactiva adaptada a ambos temas.
- 🔐 **Autenticación y Perfil**: Inicio de sesión y gestión de datos de usuario/vendedor.

## Tecnologías

- [Next.js](https://nextjs.org/) (App Router, Turbopack)
- [React](https://react.dev/)
- [node-firebird](https://github.com/hgourvest/node-firebird)
- CSS nativo modular

## Comenzando

Para ejecutar el servidor de desarrollo localmente:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
