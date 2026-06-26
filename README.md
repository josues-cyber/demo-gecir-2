# GECIR — Demo Frontend

Réplica de demostración del ERP **GECIR** (gestión para imprentas y artes gráficas),
construida con **React + Vite + TailwindCSS**. Todo el backend está **simulado en el
navegador**: los datos viven en memoria con una semilla realista y se persisten en
`localStorage`. No necesita servidor, base de datos ni red.

Pensada para **enseñar el producto**: incluye la landing, el portal del distribuidor,
el panel del usuario final (ERP completo) y el panel de administración, con toda la
lógica de negocio reproducida (estados de trabajos, conversiones presupuesto → albarán →
factura, stock e inventario, caja, pool de licencias multi-tenant, etc.).

## Arrancar

```bash
cd demo-frontend
npm install
npm run dev          # http://localhost:5174
```

Build de producción:

```bash
npm run build        # genera dist/  (desplegable en Vercel/Netlify como sitio estático)
npm run preview
```

## Cómo navegar la demo

Las credenciales aparecen **pre-rellenadas** en cada formulario; cualquier contraseña
sirve y el código 2FA es cualquier número de 6 dígitos.

| Flujo | Ruta | Qué muestra |
|-------|------|-------------|
| **Landing** | `/` | Página pública de marketing |
| **Login empresa** | `/auth/login` | Entra al ERP (usuario final / super-admin) |
| **Acceso con licencia** | `/auth/login-empresa` | Login con clave `GECIR-XXXX` |
| **Alta + pago + creación de BD** | `/auth/sign-up` → `/auth/pago` | Onboarding simulado de un cliente nuevo |
| **Solicitud de licencia** | `/entorno` | Formulario multi-paso de alta de empresa |
| **Portal distribuidor** | `/distribuidor/login` | Dashboard, pool de licencias, clientes |

### Panel de empresa (ERP)
- **Trabajos**: lista con filtros por estado, cambio de estado inline (con subestados/colores), crear/editar, marcar entregado.
- **Finanzas**: Presupuestos → (aprobar) → **convertir a Albarán** → (seleccionar) → **generar Factura**. Facturas con toggles de enviada/pagada.
- **Clientes**: directorio CRUD completo.
- **Inventario**: dashboard, productos, categorías, alertas de stock, movimientos (ajustan stock real), proveedores.
- **Caja**: resumen ingresos/gastos/balance + movimientos vinculables a trabajos.
- **Admin** (super-admin): usuarios, roles, **licencias** (activar y "crear BD", pausar, renovar) y **configuración** (empresa, SMTP por licencia, IA Groq, almacenamiento).

> En el menú **Admin** hay un botón **"Reiniciar demo"** que restaura todos los datos de ejemplo.

## Arquitectura

```
src/
  lib/
    seed.js     — datos semilla (clientes, trabajos, facturación, inventario, licencias...)
    store.jsx   — store reactivo persistido en localStorage (useSyncExternalStore)
    auth.jsx    — sesión simulada (usuario / distribuidor) en localStorage
    calc.js     — lógica de negocio (totales, estados, stats)
    format.js   — moneda y fechas (es-ES / EUR)
  components/   — UI primitives (Button, Card, Table, Modal, Toast...) + Logo
  pages/
    Landing.jsx
    auth/         — login, login-empresa, sign-up, pago
    entorno/      — solicitud de licencia
    distribuidor/ — login, registro, layout, dashboard, licencias, clientes
    app/          — layout + navegación + todos los módulos del ERP
      trabajos/  inventario/  admin/
```

## Notas

- Es una **demo de frontend**: no hay seguridad real, ni red, ni emails. Las acciones
  "enviar email", "pagar", "crear base de datos" o "enviar a Verifactu" están simuladas.
- El diseño replica el look-and-feel del GECIR real (paleta azul `#2E7CF6`, gradiente
  oscuro `#1C2333`, componentes estilo shadcn).
