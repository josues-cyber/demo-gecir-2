// Datos semilla de la demo. Simulan la base de datos de un cliente ("Imprenta Gráficas del Sur S.L.")
// más el pool de licencias del distribuidor y la metadata del super-admin.
import { daysFromNow } from "./format";

// ---- Estados de trabajo (jerárquicos, como trabajo_estados) ----
export const ESTADOS_TRABAJO = [
  { key: "pendiente_presupuesto", label: "Presupuestar", color: "#a855f7" },
  { key: "sin_asignar", label: "Sin asignar", color: "#64748b" },
  { key: "diseno_pre", label: "Diseño / Pre", color: "#ef4444" },
  { key: "produccion", label: "Producción", color: "#f97316" },
  { key: "acabados", label: "Acabados", color: "#ca8a04" },
  { key: "para_entregar", label: "Para entregar", color: "#2E7CF6" },
  { key: "entregados", label: "Entregado", color: "#22c55e" },
  { key: "finalizado", label: "Finalizado", color: "#65a30d" },
];

export const PROCESOS = [
  { key: "digital", label: "Impresión digital", color: "#3b82f6" },
  { key: "offset", label: "Impresión offset", color: "#8b5cf6" },
  { key: "rotulacion", label: "Rotulación", color: "#f59e0b" },
  { key: "dtf", label: "DTF", color: "#ec4899" },
  { key: "ext", label: "Externalizar", color: "#6b7280" },
];

export function buildSeed() {
  const clientes = [
    { id: 1, numero_referencia: 1, empresa: "Restaurante La Parra", id_alt: "C-0420", nif: "B12345678", direccion: "C/ Mayor 12", codigo_postal: "41001", ciudad: "Sevilla", provincia: "Sevilla", pais: "España", tel: "954112233", mail: "info@laparra.es", fax: "", contacto: "Marta Ruiz", cargo: "Gerente", telefono_movil: "611223344", web: "laparra.es", forma_pago: "Transferencia", dias_pago: 30, descuento: 5, acreedor: true, observaciones: "", created_at: daysFromNow(-220) },
    { id: 2, numero_referencia: 2, empresa: "Bodegas Valduero", id_alt: "C-0381", nif: "A87654321", direccion: "Ctra. del Vino s/n", codigo_postal: "47350", ciudad: "Quintanilla", provincia: "Valladolid", pais: "España", tel: "983770011", mail: "compras@valduero.com", fax: "", contacto: "Luis Pérez", cargo: "Marketing", telefono_movil: "622334455", web: "valduero.com", forma_pago: "30 días", dias_pago: 30, descuento: 0, acreedor: true, observaciones: "Cliente preferente", created_at: daysFromNow(-180) },
    { id: 3, numero_referencia: 3, empresa: "Academia Lúmen", id_alt: "C-0455", nif: "B55512300", direccion: "Av. de la Constitución 88", codigo_postal: "28013", ciudad: "Madrid", provincia: "Madrid", pais: "España", tel: "911445566", mail: "secretaria@lumen.edu", fax: "", contacto: "Ana Gómez", cargo: "Dirección", telefono_movil: "633445566", web: "lumen.edu", forma_pago: "Tarjeta", dias_pago: 0, descuento: 10, acreedor: true, observaciones: "", created_at: daysFromNow(-150) },
    { id: 4, numero_referencia: 4, empresa: "Gimnasio Pulse", id_alt: "C-0490", nif: "B99988877", direccion: "C/ Deporte 4", codigo_postal: "08025", ciudad: "Barcelona", provincia: "Barcelona", pais: "España", tel: "933221100", mail: "hola@pulsegym.com", fax: "", contacto: "Jordi Mas", cargo: "Propietario", telefono_movil: "644556677", web: "pulsegym.com", forma_pago: "Efectivo", dias_pago: 0, descuento: 0, acreedor: true, observaciones: "", created_at: daysFromNow(-90) },
    { id: 5, numero_referencia: 5, empresa: "Floristería Azahar", id_alt: "C-0512", nif: "B11122233", direccion: "Plaza Flores 2", codigo_postal: "29005", ciudad: "Málaga", provincia: "Málaga", pais: "España", tel: "952334455", mail: "pedidos@azahar.es", fax: "", contacto: "Carmen Díaz", cargo: "Gerente", telefono_movil: "655667788", web: "", forma_pago: "Transferencia", dias_pago: 15, descuento: 0, acreedor: true, observaciones: "", created_at: daysFromNow(-45) },
    { id: 6, numero_referencia: 6, empresa: "Tech Solutions IB", id_alt: "C-0533", nif: "B44455566", direccion: "C/ Innovación 21", codigo_postal: "07009", ciudad: "Palma", provincia: "Baleares", pais: "España", tel: "971112233", mail: "marketing@techib.com", fax: "", contacto: "Pau Coll", cargo: "CMO", telefono_movil: "666778899", web: "techib.com", forma_pago: "30 días", dias_pago: 30, descuento: 3, acreedor: true, observaciones: "", created_at: daysFromNow(-20) },
  ];

  const trabajos = [
    { id: 1, cliente_id: 1, numero_referencia: 1, descripcion: "Cartas menú A4 plastificadas", tipo_proceso: "digital", cantidad: 50, papel: "Estucado 300g", acabados: "Plastificado mate", estado: "para_entregar", precio: 145.0, fecha_entrada: daysFromNow(-6), ent_estimada: daysFromNow(1), observaciones: "Doble cara", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: true, laminado_brillo: false, laminado_soft: false, pago_adelantado: false },
    { id: 2, cliente_id: 2, numero_referencia: 2, descripcion: "Etiquetas vino crianza 2021", tipo_proceso: "offset", cantidad: 5000, papel: "Adhesivo texturado", acabados: "Stamping oro", estado: "produccion", precio: 980.0, fecha_entrada: daysFromNow(-4), ent_estimada: daysFromNow(5), observaciones: "Troquel especial", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: false, laminado_soft: false, pago_adelantado: true },
    { id: 3, cliente_id: 3, numero_referencia: 3, descripcion: "Dípticos curso de verano", tipo_proceso: "digital", cantidad: 300, papel: "Couché 170g", acabados: "Hendido", estado: "diseno_pre", precio: 0, fecha_entrada: daysFromNow(-2), ent_estimada: daysFromNow(7), observaciones: "Pendiente artes finales", reimpresion: false, numerado: false, perforado: false, hendido: true, laminado_mate: false, laminado_brillo: false, laminado_soft: false, pago_adelantado: false },
    { id: 4, cliente_id: 4, numero_referencia: 4, descripcion: "Lona publicitaria 3x1 m", tipo_proceso: "rotulacion", cantidad: 2, papel: "Lona frontlit", acabados: "Ojales", estado: "acabados", precio: 120.0, fecha_entrada: daysFromNow(-3), ent_estimada: daysFromNow(2), observaciones: "", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: false, laminado_soft: false, pago_adelantado: false },
    { id: 5, cliente_id: 5, numero_referencia: 5, descripcion: "Tarjetas de visita premium", tipo_proceso: "offset", cantidad: 1000, papel: "Algodón 600g", acabados: "Laminado soft + relieve", estado: "sin_asignar", precio: 0, fecha_entrada: daysFromNow(-1), ent_estimada: daysFromNow(6), observaciones: "", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: false, laminado_soft: true, pago_adelantado: false },
    { id: 6, cliente_id: 6, numero_referencia: 6, descripcion: "Camisetas evento DTF (pack 40)", tipo_proceso: "dtf", cantidad: 40, papel: "—", acabados: "", estado: "pendiente_presupuesto", precio: 0, fecha_entrada: daysFromNow(-1), ent_estimada: daysFromNow(10), observaciones: "Logo a 4 tintas", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: false, laminado_soft: false, pago_adelantado: false },
    { id: 7, cliente_id: 1, numero_referencia: 7, descripcion: "Flyers promoción verano", tipo_proceso: "digital", cantidad: 2000, papel: "Couché 135g", acabados: "", estado: "entregados", precio: 210.0, fecha_entrada: daysFromNow(-25), ent_estimada: daysFromNow(-15), fecha_finalizado: daysFromNow(-16), fecha_entregado: daysFromNow(-14), observaciones: "", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: false, laminado_soft: false, pago_adelantado: false },
    { id: 8, cliente_id: 2, numero_referencia: 8, descripcion: "Cajas estuche pack regalo", tipo_proceso: "offset", cantidad: 500, papel: "Cartón gráfico 350g", acabados: "Plastificado brillo", estado: "entregados", precio: 640.0, fecha_entrada: daysFromNow(-30), ent_estimada: daysFromNow(-18), fecha_finalizado: daysFromNow(-19), fecha_entregado: daysFromNow(-17), observaciones: "", reimpresion: false, numerado: false, perforado: false, hendido: false, laminado_mate: false, laminado_brillo: true, laminado_soft: false, pago_adelantado: false },
  ];

  const presupuestos = [
    { id: 1, numero_presupuesto: "P-0001", cliente_id: 6, trabajo_ref: "#T-0006", descripcion: "Camisetas evento DTF", estado: "pendiente", fecha_creacion: daysFromNow(-1), iva: 21, observaciones: "", lineas: [ { familia: "Textil", concepto: "Camiseta DTF 4 tintas", cantidad: 40, precio_unitario: 9.5 }, { familia: "Diseño", concepto: "Adaptación de logo", cantidad: 1, precio_unitario: 25 } ] },
    { id: 2, numero_presupuesto: "P-0002", cliente_id: 3, trabajo_ref: "#T-0003", descripcion: "Dípticos curso de verano", estado: "enviado", fecha_creacion: daysFromNow(-3), iva: 21, observaciones: "", lineas: [ { familia: "Impresión", concepto: "Díptico A5 couché 170g", cantidad: 300, precio_unitario: 0.35 } ] },
    { id: 3, numero_presupuesto: "P-0003", cliente_id: 4, trabajo_ref: "#T-0004", descripcion: "Lona publicitaria", estado: "aprobado", fecha_creacion: daysFromNow(-5), iva: 21, observaciones: "Aprobado por email", lineas: [ { familia: "Gran formato", concepto: "Lona frontlit 3x1m con ojales", cantidad: 2, precio_unitario: 55 } ] },
    { id: 4, numero_presupuesto: "P-0004", cliente_id: 5, trabajo_ref: "", descripcion: "Catálogo floristería", estado: "rechazado", fecha_creacion: daysFromNow(-8), iva: 21, observaciones: "Precio fuera de presupuesto", lineas: [ { familia: "Impresión", concepto: "Catálogo 24 pág. grapado", cantidad: 200, precio_unitario: 2.4 } ] },
  ];

  const albaranes = [
    { id: 1, numero_albaran: "A-0001", cliente_id: 1, presupuesto_id: null, numero_presupuesto: "", trabajo_descripcion: "Flyers promoción verano", estado_trabajo: "entregado", estado: "facturado", fecha_albaran: daysFromNow(-14), iva: 21, lineas: [ { concepto: "Flyer A6 couché 135g", cantidad: 2000, precio_unitario: 0.105 } ] },
    { id: 2, numero_albaran: "A-0002", cliente_id: 4, presupuesto_id: 3, numero_presupuesto: "P-0003", trabajo_descripcion: "Lona publicitaria 3x1m", estado_trabajo: "acabados", estado: "pendiente", fecha_albaran: daysFromNow(-1), iva: 21, lineas: [ { concepto: "Lona frontlit 3x1m con ojales", cantidad: 2, precio_unitario: 55 } ] },
  ];

  const facturas = [
    { id: 1, numero_factura: "F-2026-0001", cliente_id: 1, numero_presupuesto: "", concepto: "Flyers promoción verano", fecha_factura: daysFromNow(-13), fecha_enviado: daysFromNow(-13), fechafact_pagada: daysFromNow(-10), iva: 21, lineas: [ { concepto: "Flyer A6 couché 135g", cantidad: 2000, precio_unitario: 0.105 } ] },
    { id: 2, numero_factura: "F-2026-0002", cliente_id: 2, numero_presupuesto: "", concepto: "Cajas estuche pack regalo", fecha_factura: daysFromNow(-16), fecha_enviado: daysFromNow(-16), fechafact_pagada: null, iva: 21, lineas: [ { concepto: "Estuche cartón 350g plastificado", cantidad: 500, precio_unitario: 1.28 } ] },
  ];

  const categorias = [
    { id: 1, nombre: "Papel", color: "#3b82f6", descripcion: "Soportes de impresión", activo: true, subcategorias: [ { id: 11, nombre: "Couché", color: "#60a5fa" }, { id: 12, nombre: "Estucado", color: "#93c5fd" } ] },
    { id: 2, nombre: "Tintas", color: "#ec4899", descripcion: "Consumibles de impresión", activo: true, subcategorias: [ { id: 21, nombre: "Tóner", color: "#f472b6" }, { id: 22, nombre: "Tinta DTF", color: "#f9a8d4" } ] },
    { id: 3, nombre: "Acabados", color: "#f59e0b", descripcion: "Material de acabado", activo: true, subcategorias: [ { id: 31, nombre: "Laminados", color: "#fbbf24" } ] },
  ];

  const productos = [
    { id: 1, codigo: "PAP-C170", nombre: "Couché brillo 170g (A3)", descripcion: "Resma 250 hojas", categoria_id: 1, subcategoria_id: 11, precio_compra: 12.5, precio_venta: 19.9, stock_actual: 8, stock_minimo: 10, stock_maximo: 60, unidad_medida: "resma", ubicacion: "Estante A1", proveedor_principal: "Distribuciones Gráficas SL" },
    { id: 2, codigo: "PAP-E300", nombre: "Estucado 300g (A3)", descripcion: "Resma 125 hojas", categoria_id: 1, subcategoria_id: 12, precio_compra: 18.0, precio_venta: 28.0, stock_actual: 25, stock_minimo: 8, stock_maximo: 50, unidad_medida: "resma", ubicacion: "Estante A2", proveedor_principal: "Distribuciones Gráficas SL" },
    { id: 3, codigo: "TIN-DTF-W", nombre: "Tinta DTF Blanca 1L", descripcion: "Botella 1 litro", categoria_id: 2, subcategoria_id: 22, precio_compra: 35.0, precio_venta: 59.0, stock_actual: 0, stock_minimo: 3, stock_maximo: 15, unidad_medida: "ud", ubicacion: "Armario T", proveedor_principal: "InkSupply Iberia" },
    { id: 4, codigo: "TON-BK", nombre: "Tóner negro Konica", descripcion: "Cartucho original", categoria_id: 2, subcategoria_id: 21, precio_compra: 78.0, precio_venta: 120.0, stock_actual: 4, stock_minimo: 2, stock_maximo: 10, unidad_medida: "ud", ubicacion: "Armario T", proveedor_principal: "InkSupply Iberia" },
    { id: 5, codigo: "LAM-MATE", nombre: "Bobina laminado mate 320mm", descripcion: "Rollo 200m", categoria_id: 3, subcategoria_id: 31, precio_compra: 42.0, precio_venta: 70.0, stock_actual: 6, stock_minimo: 4, stock_maximo: 20, unidad_medida: "rollo", ubicacion: "Estante C3", proveedor_principal: "Acabados Pro" },
  ];

  const movimientosInventario = [
    { id: 1, tipo: "salida", producto_id: 1, producto: "Couché brillo 170g (A3)", cantidad: 4, motivo: "Consumo trabajo #T-0007", fecha: daysFromNow(-13), usuario: "Admin Demo" },
    { id: 2, tipo: "entrada", producto_id: 2, producto: "Estucado 300g (A3)", cantidad: 20, motivo: "Compra a proveedor", fecha: daysFromNow(-10), usuario: "Admin Demo" },
    { id: 3, tipo: "salida", producto_id: 3, producto: "Tinta DTF Blanca 1L", cantidad: 3, motivo: "Consumo producción DTF", fecha: daysFromNow(-5), usuario: "Admin Demo" },
    { id: 4, tipo: "ajuste", producto_id: 4, producto: "Tóner negro Konica", cantidad: -1, motivo: "Ajuste de inventario", fecha: daysFromNow(-2), usuario: "Admin Demo" },
  ];

  const proveedores = [
    { id: 1, nombre: "Distribuciones Gráficas SL", nif: "B30011223", tel: "960112233", mail: "ventas@disgraficas.es", contacto: "Roberto Vela" },
    { id: 2, nombre: "InkSupply Iberia", nif: "B30044556", tel: "960445566", mail: "pedidos@inksupply.es", contacto: "Nadia Roca" },
    { id: 3, nombre: "Acabados Pro", nif: "B30077889", tel: "960778899", mail: "info@acabadospro.es", contacto: "Sergio Lima" },
  ];

  const movimientosCaja = [
    { id: 1, tipo: "ingreso", concepto: "Pago factura F-2026-0001", importe: 254.1, cliente_id: 1, trabajo_ref: "#T-0007", metodo_pago: "Transferencia", observaciones: "", fecha: daysFromNow(-10) },
    { id: 2, tipo: "gasto", concepto: "Compra papel estucado", importe: 360.0, cliente_id: null, trabajo_ref: "", metodo_pago: "Transferencia", observaciones: "Distribuciones Gráficas", fecha: daysFromNow(-10) },
    { id: 3, tipo: "ingreso", concepto: "Anticipo etiquetas vino", importe: 490.0, cliente_id: 2, trabajo_ref: "#T-0002", metodo_pago: "Transferencia", observaciones: "50% adelantado", fecha: daysFromNow(-4) },
    { id: 4, tipo: "gasto", concepto: "Tinta DTF + tóner", importe: 183.0, cliente_id: null, trabajo_ref: "", metodo_pago: "Tarjeta", observaciones: "InkSupply", fecha: daysFromNow(-5) },
    { id: 5, tipo: "ingreso", concepto: "Venta mostrador tarjetas", importe: 60.5, cliente_id: null, trabajo_ref: "", metodo_pago: "Efectivo", observaciones: "", fecha: daysFromNow(-2) },
  ];

  const usuarios = [
    { id: 1, nombre: "Admin", apellidos: "Demo", email: "admin@graficasdelsur.es", rol: "Administrador", activo: true, ultimo_acceso: daysFromNow(-0.2), created_at: daysFromNow(-220) },
    { id: 2, nombre: "Laura", apellidos: "Diseño", email: "laura@graficasdelsur.es", rol: "Usuario", activo: true, ultimo_acceso: daysFromNow(-1), created_at: daysFromNow(-120) },
    { id: 3, nombre: "Marcos", apellidos: "Producción", email: "marcos@graficasdelsur.es", rol: "Empleado", activo: true, ultimo_acceso: daysFromNow(-3), created_at: daysFromNow(-100) },
    { id: 4, nombre: "Sara", apellidos: "Antigua", email: "sara@graficasdelsur.es", rol: "Empleado", activo: false, ultimo_acceso: daysFromNow(-60), created_at: daysFromNow(-200) },
  ];

  const roles = [
    { id: 1, nombre: "Administrador", descripcion: "Acceso completo", permisos: "*", usuarios: 1 },
    { id: 2, nombre: "Usuario", descripcion: "Acceso estándar a módulos", permisos: "*", usuarios: 1 },
    { id: 3, nombre: "Empleado", descripcion: "Trabajos y producción", permisos: "parcial", usuarios: 2 },
  ];

  const companySettings = {
    nombre_empresa: "Imprenta Gráficas del Sur S.L.",
    email: "info@graficasdelsur.es",
    telefono: "954 11 22 33",
    direccion: "Polígono Industrial Calonge, Nave 14, Sevilla",
    web: "graficasdelsur.es",
    pais: "España",
    country_code: "ES",
    moneda: "EUR",
    iva_default: 21,
    aviso_legal: "Gráficas del Sur S.L. — NIF B-41xxxxxx. Inscrita en el Registro Mercantil de Sevilla.",
    smtp_default: true,
    groq_configurada: false,
  };

  // ---- Pool de licencias del distribuidor (master DB) ----
  const licencias = [
    { id: 1, license_key: "GECIR-4F8A2C9D1B3E", estado: "activa", email: "info@graficasdelsur.es", empresa: "Imprenta Gráficas del Sur S.L.", proveedor: "REPRISE", vencimiento: daysFromNow(280), almacenamiento_mb: 42, db_status: "READY", pausada: false },
    { id: 2, license_key: "GECIR-7B1E9A4C2D6F", estado: "activa", email: "pedidos@artprintbcn.com", empresa: "ArtPrint Barcelona", proveedor: "REPRISE", vencimiento: daysFromNow(120), almacenamiento_mb: 88, db_status: "READY", pausada: false },
    { id: 3, license_key: "GECIR-1C3D5E7F9A2B", estado: "asignada", email: "nuevo@imprentaluz.es", empresa: "", proveedor: "REPRISE", vencimiento: null, almacenamiento_mb: 0, db_status: "PENDING", pausada: false },
    { id: 4, license_key: "GECIR-9E2F4A6C8D1B", estado: "disponible", email: "", empresa: "", proveedor: "REPRISE", vencimiento: null, almacenamiento_mb: 0, db_status: "—", pausada: false },
    { id: 5, license_key: "GECIR-3A5C7E9F1B2D", estado: "disponible", email: "", empresa: "", proveedor: "REPRISE", vencimiento: null, almacenamiento_mb: 0, db_status: "—", pausada: false },
    { id: 6, license_key: "GECIR-6D8F1A3C5E7B", estado: "inactiva", email: "old@printvalencia.es", empresa: "Print Valencia", proveedor: "REPRISE", vencimiento: daysFromNow(-30), almacenamiento_mb: 35, db_status: "READY", pausada: true },
  ];

  // Solicitudes de licencia pendientes (admin → pestaña Pendientes)
  const solicitudes = [
    { id: 101, empresa: "Rótulos Mediterráneo", email: "admin@rotulosmed.es", license_key: "GECIR-PENDIENTE-001", proveedor: "REPRISE", estado: "pending_verification", pais: "España", fecha: daysFromNow(-1), db_status: "PENDING" },
    { id: 102, empresa: "Copistería Central", email: "info@copicentral.es", license_key: "GECIR-PENDIENTE-002", proveedor: "REPRISE", estado: "verified", pais: "España", fecha: daysFromNow(-2), db_status: "PENDING" },
  ];

  // Clientes del distribuidor (métricas agregadas, con facturación y comparativa mes anterior)
  const distribuidorClientes = [
    { id: 1, empresa: "Imprenta Gráficas del Sur S.L.", pais: "España", trabajos_mes: 34, trabajos_mes_anterior: 28, facturacion_mes: 12450, facturacion_mes_anterior: 10120, dias_activos: 220, alertas_stock: 2, estado: "activo" },
    { id: 2, empresa: "ArtPrint Barcelona", pais: "España", trabajos_mes: 52, trabajos_mes_anterior: 47, facturacion_mes: 21380, facturacion_mes_anterior: 19540, dias_activos: 140, alertas_stock: 0, estado: "activo" },
    { id: 3, empresa: "Rotativa Mediterránea", pais: "España", trabajos_mes: 41, trabajos_mes_anterior: 33, facturacion_mes: 18900, facturacion_mes_anterior: 14200, dias_activos: 180, alertas_stock: 3, estado: "activo" },
    { id: 4, empresa: "Gráficas Andinas (México)", pais: "México", trabajos_mes: 29, trabajos_mes_anterior: 22, facturacion_mes: 9750, facturacion_mes_anterior: 8100, dias_activos: 70, alertas_stock: 1, estado: "activo" },
    { id: 5, empresa: "Impresos do Brasil", pais: "Brasil", trabajos_mes: 18, trabajos_mes_anterior: 12, facturacion_mes: 6420, facturacion_mes_anterior: 5300, dias_activos: 45, alertas_stock: 4, estado: "activo" },
    { id: 6, empresa: "Print Valencia", pais: "España", trabajos_mes: 0, trabajos_mes_anterior: 8, facturacion_mes: 0, facturacion_mes_anterior: 3100, dias_activos: 95, alertas_stock: 5, estado: "inactivo" },
  ];

  // Catálogo de REFERENCIAS (consumibles de imprenta) del distribuidor — stock, precio venta, unidades vendidas
  const referencias = [
    { id: 1, codigo: "REF-1001", nombre: "Papel couché brillo 150g (A3)", categoria: "Papel", stock: 320, precio_venta: 18.5, unidades_vendidas: 1240 },
    { id: 2, codigo: "REF-1002", nombre: "Papel estucado mate 300g (A3)", categoria: "Papel", stock: 180, precio_venta: 26.0, unidades_vendidas: 980 },
    { id: 3, codigo: "REF-1003", nombre: "Cartulina gráfica 350g", categoria: "Papel", stock: 95, precio_venta: 32.0, unidades_vendidas: 410 },
    { id: 4, codigo: "REF-1004", nombre: "Tóner negro (cartucho)", categoria: "Consumible", stock: 540, precio_venta: 95.0, unidades_vendidas: 1520 },
    { id: 5, codigo: "REF-1005", nombre: "Tinta CMYK pack (offset)", categoria: "Consumible", stock: 210, precio_venta: 120.0, unidades_vendidas: 870 },
    { id: 6, codigo: "REF-1006", nombre: "Bobina laminado brillo 320mm", categoria: "Acabados", stock: 60, precio_venta: 68.0, unidades_vendidas: 320 },
    { id: 7, codigo: "REF-1007", nombre: "Vinilo gran formato (m²)", categoria: "Gran formato", stock: 28, precio_venta: 12.0, unidades_vendidas: 1520 },
    { id: 8, codigo: "REF-1008", nombre: "Plancha offset CTP", categoria: "Consumible", stock: 0, precio_venta: 6.5, unidades_vendidas: 870 },
  ];

  // Pedidos del distribuidor por cliente (qué ha pedido cada cliente y con qué referencias)
  const pedidosDistribuidor = [
    { id: 1, cliente_id: 3, referencia_id: 1, cantidad: 200, fecha: daysFromNow(-3) },
    { id: 2, cliente_id: 3, referencia_id: 4, cantidad: 150, fecha: daysFromNow(-12) },
    { id: 3, cliente_id: 3, referencia_id: 7, cantidad: 40, fecha: daysFromNow(-20) },
    { id: 4, cliente_id: 1, referencia_id: 2, cantidad: 120, fecha: daysFromNow(-5) },
    { id: 5, cliente_id: 1, referencia_id: 5, cantidad: 300, fecha: daysFromNow(-18) },
    { id: 6, cliente_id: 2, referencia_id: 3, cantidad: 80, fecha: daysFromNow(-2) },
    { id: 7, cliente_id: 2, referencia_id: 1, cantidad: 500, fecha: daysFromNow(-9) },
    { id: 8, cliente_id: 2, referencia_id: 6, cantidad: 90, fecha: daysFromNow(-25) },
    { id: 9, cliente_id: 4, referencia_id: 4, cantidad: 220, fecha: daysFromNow(-7) },
    { id: 10, cliente_id: 5, referencia_id: 8, cantidad: 60, fecha: daysFromNow(-4) },
    { id: 11, cliente_id: 1, referencia_id: 4, cantidad: 100, fecha: daysFromNow(-1) },
    { id: 12, cliente_id: 3, referencia_id: 2, cantidad: 60, fecha: daysFromNow(-1) },
  ];

  // Evolutivo de facturación del distribuidor (últimos 6 meses)
  const facturacionMensual = [
    { mes: "Ene", importe: 41200 },
    { mes: "Feb", importe: 45800 },
    { mes: "Mar", importe: 52300 },
    { mes: "Abr", importe: 49700 },
    { mes: "May", importe: 58100 },
    { mes: "Jun", importe: 68900 },
  ];

  // Alertas de stock de los clientes (visibles para el distribuidor para reponer)
  const alertasDistribuidor = [
    { id: 1, cliente_id: 1, empresa: "Imprenta Gráficas del Sur S.L.", referencia: "Papel estucado mate 300g (A3)", codigo: "REF-1002", stock_actual: 3, stock_minimo: 20, tipo: "stock_bajo" },
    { id: 2, cliente_id: 1, empresa: "Imprenta Gráficas del Sur S.L.", referencia: "Vinilo gran formato (m²)", codigo: "REF-1007", stock_actual: 0, stock_minimo: 10, tipo: "sin_stock" },
    { id: 3, cliente_id: 3, empresa: "Rotativa Mediterránea", referencia: "Tóner negro (cartucho)", codigo: "REF-1004", stock_actual: 8, stock_minimo: 50, tipo: "stock_bajo" },
    { id: 4, cliente_id: 3, empresa: "Rotativa Mediterránea", referencia: "Bobina laminado brillo 320mm", codigo: "REF-1006", stock_actual: 0, stock_minimo: 15, tipo: "sin_stock" },
    { id: 5, cliente_id: 3, empresa: "Rotativa Mediterránea", referencia: "Tinta CMYK pack (offset)", codigo: "REF-1005", stock_actual: 12, stock_minimo: 40, tipo: "stock_bajo" },
    { id: 6, cliente_id: 4, empresa: "Gráficas Andinas (México)", referencia: "Plancha offset CTP", codigo: "REF-1008", stock_actual: 0, stock_minimo: 25, tipo: "sin_stock" },
    { id: 7, cliente_id: 5, empresa: "Impresos do Brasil", referencia: "Papel couché brillo 150g (A3)", codigo: "REF-1001", stock_actual: 5, stock_minimo: 30, tipo: "stock_bajo" },
    { id: 8, cliente_id: 5, empresa: "Impresos do Brasil", referencia: "Cartulina gráfica 350g", codigo: "REF-1003", stock_actual: 2, stock_minimo: 15, tipo: "stock_bajo" },
  ];

  // Ofertas PBS precargadas por el distribuidor (familia dentro del inventario del cliente)
  const ofertasPBS = [
    { id: 1, nombre: "Papel couché brillo 150g (A3)", referencia: "REF-1001", precio_oferta: 14.9, stock_oferta: 500, distribuidor: "REPRISE", vigencia: daysFromNow(20) },
    { id: 2, nombre: "Tóner negro (cartucho)", referencia: "REF-1004", precio_oferta: 79.0, stock_oferta: 120, distribuidor: "REPRISE", vigencia: daysFromNow(12) },
    { id: 3, nombre: "Vinilo gran formato (m²)", referencia: "REF-1007", precio_oferta: 8.9, stock_oferta: 300, distribuidor: "REPRISE", vigencia: daysFromNow(30) },
  ];

  return {
    clientes,
    trabajos,
    presupuestos,
    albaranes,
    facturas,
    categorias,
    productos,
    movimientosInventario,
    proveedores,
    movimientosCaja,
    usuarios,
    roles,
    companySettings,
    licencias,
    solicitudes,
    distribuidorClientes,
    referencias,
    pedidosDistribuidor,
    facturacionMensual,
    alertasDistribuidor,
    ofertasPBS,
    _counters: {
      trabajo: 8,
      cliente: 6,
      presupuesto: 4,
      albaran: 2,
      factura: 2,
      producto: 5,
      movInv: 4,
      movCaja: 5,
      usuario: 4,
      referencia: 8,
      ofertaPBS: 3,
    },
  };
}
