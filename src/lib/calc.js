// Cálculos derivados (totales de documentos, estadísticas) — lógica de negocio simulada.
import { ESTADOS_TRABAJO, PROCESOS } from "./seed";

export function lineasBase(lineas = []) {
  return lineas.reduce((s, l) => s + Number(l.cantidad || 0) * Number(l.precio_unitario || 0), 0);
}
export function docTotales(doc) {
  const base = lineasBase(doc.lineas);
  const iva = base * (Number(doc.iva || 0) / 100);
  return { base, iva, total: base + iva };
}

export function estadoInfo(key) {
  return ESTADOS_TRABAJO.find((e) => e.key === key) || { label: key, color: "#94a3b8" };
}
export function procesoInfo(key) {
  return PROCESOS.find((p) => p.key === key) || { label: key, color: "#94a3b8" };
}

export function trabajosStats(trabajos) {
  const by = (k) => trabajos.filter((t) => t.estado === k).length;
  return {
    sin_asignar: by("sin_asignar"),
    pendiente_presupuesto: by("pendiente_presupuesto"),
    produccion: trabajos.filter((t) => ["diseno_pre", "produccion", "acabados"].includes(t.estado)).length,
    para_entregar: by("para_entregar"),
    entregados: by("entregados"),
    pendientes: trabajos.filter((t) => !["pendiente_presupuesto", "para_entregar", "entregados", "finalizado"].includes(t.estado)).length,
  };
}

export function cajaResumen(movs) {
  const ingresos = movs.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.importe || 0), 0);
  const gastos = movs.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Number(m.importe || 0), 0);
  return { ingresos, gastos, saldo: ingresos - gastos };
}

export function inventarioStats(productos) {
  const valorTotal = productos.reduce((s, p) => s + Number(p.stock_actual || 0) * Number(p.precio_compra || 0), 0);
  const stockBajo = productos.filter((p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo).length;
  const sinStock = productos.filter((p) => p.stock_actual === 0).length;
  return { total: productos.length, valorTotal, stockBajo, sinStock, alertas: stockBajo + sinStock };
}

export function alertasInventario(productos) {
  const out = [];
  for (const p of productos) {
    if (p.stock_actual === 0) out.push({ tipo: "sin_stock", producto: p });
    else if (p.stock_actual <= p.stock_minimo) out.push({ tipo: "stock_bajo", producto: p });
    else if (p.stock_maximo && p.stock_actual > p.stock_maximo) out.push({ tipo: "stock_alto", producto: p });
  }
  return out;
}

/* ---------------- Métricas del distribuidor (para dashboards orientados a CEO) ---------------- */

export function pct(actual, anterior) {
  if (!anterior) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

/** Facturación de cada referencia = unidades vendidas × precio de venta. */
export function referenciaFacturacion(ref) {
  return Number(ref.unidades_vendidas || 0) * Number(ref.precio_venta || 0);
}

export function distribuidorMetrics(data) {
  const clientes = data.distribuidorClientes || [];
  const refs = data.referencias || [];
  const activos = clientes.filter((c) => c.estado === "activo");

  const facturacionMes = clientes.reduce((s, c) => s + Number(c.facturacion_mes || 0), 0);
  const facturacionMesAnterior = clientes.reduce((s, c) => s + Number(c.facturacion_mes_anterior || 0), 0);
  const trabajosMes = clientes.reduce((s, c) => s + Number(c.trabajos_mes || 0), 0);
  const trabajosMesAnterior = clientes.reduce((s, c) => s + Number(c.trabajos_mes_anterior || 0), 0);
  const alertasStock = clientes.reduce((s, c) => s + Number(c.alertas_stock || 0), 0);

  const refsOrdenadas = refs.slice().sort((a, b) => b.unidades_vendidas - a.unidades_vendidas);
  const refMasVendida = refsOrdenadas[0] || null;
  const refMenosVendida = refsOrdenadas[refsOrdenadas.length - 1] || null;
  const mejorCliente = clientes.slice().sort((a, b) => b.facturacion_mes - a.facturacion_mes)[0] || null;

  return {
    clientesActivos: activos.length,
    clientesInactivos: clientes.length - activos.length,
    facturacionMes, facturacionMesAnterior, facturacionPct: pct(facturacionMes, facturacionMesAnterior),
    trabajosMes, trabajosMesAnterior, trabajosPct: pct(trabajosMes, trabajosMesAnterior),
    alertasStock,
    refMasVendida, refMenosVendida, mejorCliente,
  };
}

/** Pedidos de un cliente del distribuidor, resueltos con su referencia. */
export function pedidosDeCliente(data, clienteId) {
  const refById = Object.fromEntries((data.referencias || []).map((r) => [r.id, r]));
  return (data.pedidosDistribuidor || [])
    .filter((p) => p.cliente_id === clienteId)
    .map((p) => {
      const ref = refById[p.referencia_id] || {};
      const importe = Number(p.cantidad || 0) * Number(ref.precio_venta || 0);
      return { ...p, referencia: ref, importe };
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/** Rankings derivados de las bases de datos del distribuidor. */
export function distribuidorRankings(data) {
  const clientes = data.distribuidorClientes || [];
  const refs = data.referencias || [];

  const mejoresClientes = clientes.slice().sort((a, b) => b.facturacion_mes - a.facturacion_mes).slice(0, 5);
  const masVendidas = refs.slice().sort((a, b) => b.unidades_vendidas - a.unidades_vendidas).slice(0, 5);
  const mayorFacturacion = refs.slice().sort((a, b) => referenciaFacturacion(b) - referenciaFacturacion(a)).slice(0, 5);
  const masActivos = clientes.slice().sort((a, b) => b.trabajos_mes - a.trabajos_mes).slice(0, 5);
  return { mejoresClientes, masVendidas, mayorFacturacion, masActivos };
}
