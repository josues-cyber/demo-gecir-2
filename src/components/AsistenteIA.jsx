import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useDb, db } from "../lib/store";
import { trabajosStats, cajaResumen, alertasInventario } from "../lib/calc";
import { ESTADOS_TRABAJO } from "../lib/seed";
import { formatCurrency, todayISO } from "../lib/format";

const SUGERENCIAS = [
  "Mueve el trabajo #T-0003 a producción",
  "Marca la factura F-2026-0002 como pagada",
  "¿Qué alertas de stock tengo?",
  "Registra un ingreso de 150€ por venta mostrador",
];

/* ───────── Acciones ejecutables (mutan el store) ───────── */
// Devuelve un string de confirmación si ejecutó algo, o null si no hubo acción.
function ejecutarAccion(texto, navigate) {
  const t = texto.toLowerCase();
  const has = (...w) => w.some((x) => t.includes(x));
  const data = db.get();

  // 1) Navegación: "abre/ve a/muéstrame ..."
  if (has("abre", "ábreme", "abreme", "ve a", "ir a", "llévame", "llevame", "muéstrame", "muestrame", "vamos a")) {
    const RUTAS = [
      { kw: ["factura"], to: "/app/facturas", label: "Facturas" },
      { kw: ["presupuesto"], to: "/app/presupuestos", label: "Presupuestos" },
      { kw: ["albarán", "albaran"], to: "/app/albaranes", label: "Albaranes" },
      { kw: ["cliente"], to: "/app/clientes", label: "Clientes" },
      { kw: ["inventario", "producto", "stock"], to: "/app/inventario", label: "Inventario" },
      { kw: ["caja", "ingreso", "gasto"], to: "/app/caja", label: "Caja" },
      { kw: ["trabajo"], to: "/app/trabajos", label: "Trabajos" },
      { kw: ["inicio", "dashboard", "panel"], to: "/app", label: "el panel principal" },
    ];
    const r = RUTAS.find((x) => x.kw.some((k) => t.includes(k)));
    if (r) { navigate(r.to); return `Abriendo ${r.label} 👉`; }
  }

  // 2) Facturas: marcar como pagada / enviada
  if (has("factura") && has("pagad", "cobrad", "envi")) {
    const fac = encontrarFactura(t, data.facturas);
    if (!fac) return "No encuentro esa factura. Dime el número, por ejemplo \"F-2026-0002\".";
    const marcarEnviada = has("envi");
    db.update((s) => {
      const f = s.facturas.find((x) => x.id === fac.id);
      if (marcarEnviada) f.fecha_enviado = todayISO();
      else f.fechafact_pagada = todayISO();
    });
    return `✅ Hecho. Marqué la factura ${fac.numero_factura} como ${marcarEnviada ? "enviada" : "pagada"}.`;
  }

  // 3) Trabajos: mover de estado en el pipeline
  if (has("mueve", "mover", "pasa", "pasar", "cambia", "cambiar", "muévelo", "muevelo")) {
    const trab = encontrarTrabajo(t, data.trabajos);
    const estado = encontrarEstado(t);
    if (trab && estado) {
      db.update((s) => {
        const x = s.trabajos.find((y) => y.id === trab.id);
        x.estado = estado.key;
        if (estado.key === "entregados") x.fecha_entregado = todayISO();
        if (estado.key === "finalizado") x.fecha_finalizado = todayISO();
      });
      return `✅ Moví el trabajo #T-${String(trab.numero_referencia).padStart(4, "0")} a "${estado.label}".`;
    }
    if (trab && !estado) return "¿A qué estado lo muevo? (sin asignar, diseño, producción, acabados, para entregar, entregado).";
  }

  // 4) Caja: registrar ingreso / gasto
  if (has("registra", "apunta", "anota", "añade", "agrega") && has("ingreso", "gasto", "cobro", "pago")) {
    const tipo = has("gasto", "pago") && !has("ingreso", "cobro") ? "gasto" : "ingreso";
    const m = texto.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return "¿De qué importe? Ej: \"registra un ingreso de 150€ por venta\".";
    const importe = parseFloat(m[1].replace(",", "."));
    const conceptoM = texto.match(/\bpor\s+(.+)$/i);
    const concepto = conceptoM ? conceptoM[1].trim() : `${tipo === "ingreso" ? "Ingreso" : "Gasto"} registrado por el asistente`;
    const id = db.nextId("movCaja");
    db.update((s) => {
      s.movimientosCaja.push({ id, tipo, concepto, importe, cliente_id: null, trabajo_ref: "", metodo_pago: "Efectivo", observaciones: "Vía asistente IA", fecha: todayISO() });
    });
    return `✅ Registré un ${tipo} de ${formatCurrency(importe)} — "${concepto}".`;
  }

  // 5) Clientes: crear
  if (has("crea", "crear", "nuevo", "añade", "agrega", "da de alta") && has("cliente")) {
    const nombre = extraerNombre(texto);
    if (!nombre) return "¿Cómo se llama el cliente? Ej: \"crea un cliente llamado Floristería Sol\".";
    const id = db.nextId("cliente");
    db.update((s) => {
      s.clientes.push({ id, numero_referencia: id, empresa: nombre, id_alt: "", nif: "", direccion: "", ciudad: "", pais: "España", tel: "", mail: "", contacto: "", forma_pago: "Transferencia", dias_pago: 0, descuento: 0, acreedor: true, created_at: todayISO() });
    });
    return `✅ Cliente "${nombre}" creado (ref. #CL-${String(id).padStart(4, "0")}).`;
  }

  // 6) Inventario: reponer stock de un producto
  if (has("repon", "repón", "reponer", "rellena", "rellenar", "suma stock", "añade stock", "incrementa")) {
    const prod = encontrarProducto(t, data.productos);
    if (!prod) return "¿De qué producto repongo stock? Dime su nombre o código.";
    const m = texto.match(/(\d+)/);
    const cant = m ? parseInt(m[1], 10) : Math.max(prod.stock_minimo + 5 - prod.stock_actual, 10);
    const idMov = db.nextId("movInv");
    db.update((s) => {
      const p = s.productos.find((x) => x.id === prod.id);
      p.stock_actual += cant;
      s.movimientosInventario.push({ id: idMov, tipo: "entrada", producto_id: p.id, producto: p.nombre, cantidad: cant, motivo: "Reposición vía asistente IA", fecha: todayISO(), usuario: "Asistente IA" });
    });
    return `✅ Repuse ${cant} uds de "${prod.nombre}". Nuevo stock: ${prod.stock_actual + cant}.`;
  }

  return null;
}

/* ───────── Helpers de búsqueda ───────── */
function encontrarFactura(t, facturas) {
  return facturas.find((f) => {
    const num = f.numero_factura.toLowerCase();
    const tail = num.split("-").pop();
    return t.includes(num) || (tail && t.includes(tail));
  });
}
function encontrarTrabajo(t, trabajos) {
  const m = t.match(/#?t?-?\s*0*(\d{1,4})/); // #T-0003, t-3, "trabajo 3"
  const num = m ? parseInt(m[1], 10) : null;
  if (num == null) return null;
  return trabajos.find((x) => x.numero_referencia === num);
}
function encontrarEstado(t) {
  // "para entregar" antes que "entregado" para no confundirlos
  if (t.includes("para entregar")) return ESTADOS_TRABAJO.find((e) => e.key === "para_entregar");
  const orden = [
    ["finaliz", "finalizado"], ["entreg", "entregados"], ["acabad", "acabados"],
    ["produc", "produccion"], ["diseñ", "diseno_pre"], ["dise", "diseno_pre"],
    ["presupuest", "pendiente_presupuesto"], ["sin asignar", "sin_asignar"], ["asignar", "sin_asignar"],
  ];
  for (const [frag, key] of orden) if (t.includes(frag)) return ESTADOS_TRABAJO.find((e) => e.key === key);
  return null;
}
function encontrarProducto(t, productos) {
  return productos.find((p) => t.includes(p.codigo.toLowerCase())) ||
    productos.find((p) => p.nombre.toLowerCase().split(/[\s(),]+/).some((w) => w.length >= 4 && t.includes(w)));
}
function extraerNombre(texto) {
  let m = texto.match(/llamad[oa]\s+(.+)$/i) || texto.match(/cliente\s+(?:nuevo\s+|llamad[oa]\s+)?(.+)$/i);
  if (!m) return null;
  return m[1].replace(/["'.]/g, "").trim().replace(/\s+/g, " ");
}

/* ───────── Respuestas informativas (sin acción) ───────── */
function generarRespuesta(texto, data) {
  const t = texto.toLowerCase();
  const has = (...w) => w.some((x) => t.includes(x));

  if (has("hola", "buenas", "hey")) return "¡Hola! 👋 Puedo ejecutar acciones por ti: mover trabajos, marcar facturas, crear clientes, registrar caja o reponer stock. También doy resúmenes. ¿Qué hacemos?";
  if (has("pendiente", "trabajo", "pipeline", "producción", "produccion")) {
    const s = trabajosStats(data.trabajos);
    return `Tienes ${s.pendientes} trabajos pendientes · ${s.sin_asignar} sin asignar · ${s.produccion} en producción · ${s.para_entregar} para entregar.\n\nPrueba: "mueve el trabajo #T-0005 a producción".`;
  }
  if (has("stock", "inventario", "alerta", "mínimo", "minimo")) {
    const al = alertasInventario(data.productos);
    if (al.length === 0) return "Inventario al día ✅, nada bajo mínimo.";
    const lista = al.slice(0, 5).map((a) => `• ${a.producto.nombre} — ${a.producto.stock_actual}/${a.producto.stock_minimo}`).join("\n");
    return `⚠️ ${al.length} alertas de stock:\n${lista}\n\nDi "repón stock de ${al[0].producto.nombre.split(" ")[0]}" y lo hago.`;
  }
  if (has("caja", "balance", "ingreso", "gasto")) {
    const c = cajaResumen(data.movimientosCaja);
    return `Caja → Ingresos ${formatCurrency(c.ingresos)} · Gastos ${formatCurrency(c.gastos)} · Balance ${formatCurrency(c.saldo)}.`;
  }
  if (has("factura", "cobrar", "pagar")) {
    const sinPagar = data.facturas.filter((f) => !f.fechafact_pagada).length;
    return `Hay ${sinPagar} factura(s) sin pagar. Di "marca la factura F-2026-0002 como pagada" y la actualizo.`;
  }
  if (has("cliente")) return `Tienes ${data.clientes.length} clientes. Di "crea un cliente llamado ..." y lo doy de alta.`;
  if (has("gracias")) return "¡A ti! 🙌";

  return "Puedo ejecutar acciones: \"mueve el trabajo #T-0003 a acabados\", \"marca la factura F-2026-0002 como pagada\", \"crea un cliente llamado X\", \"registra un gasto de 80€ por tinta\" o \"repón stock de tóner\".";
}

export default function AsistenteIA() {
  const data = useDb();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { de: "bot", texto: "¡Hola! 👋 Soy el asistente IA de GECIR. Puedo darte resúmenes y también ejecutar acciones (mover trabajos, marcar facturas, crear clientes, registrar caja, reponer stock). ¿Qué necesitas?" },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, typing, open]);

  function enviar(texto) {
    const msg = (texto ?? input).trim();
    if (!msg) return;
    setMensajes((m) => [...m, { de: "user", texto: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const accion = ejecutarAccion(msg, navigate);
      const respuesta = accion || generarRespuesta(msg, db.get());
      setTyping(false);
      setMensajes((m) => [...m, { de: "bot", texto: respuesta, accion: !!accion }]);
    }, 750);
  }

  return (
    <div className="no-print">
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-[380px] h-[520px] max-h-[75vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-ink-gradient text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#60a5fa]" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Asistente IA</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> En línea · ejecuta acciones
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
                {m.de === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-[#2E7CF6]/10 flex items-center justify-center mr-2 shrink-0 self-end">
                    <Bot className="w-4 h-4 text-[#2E7CF6]" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${m.de === "user" ? "bg-[#2E7CF6] text-white rounded-br-sm" : m.accion ? "bg-green-50 border border-green-200 text-slate-700 rounded-bl-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"}`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[#2E7CF6]/10 flex items-center justify-center mr-2 shrink-0 self-end">
                  <Bot className="w-4 h-4 text-[#2E7CF6]" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                  {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>

          {mensajes.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50">
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => enviar(s)} className="text-xs bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 hover:border-[#2E7CF6] hover:text-[#2E7CF6] text-left">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pídeme algo o escribe una orden..."
              className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2E7CF6] focus:ring-2 focus:ring-[#2E7CF6]/20" />
            <button type="submit" className="w-10 h-10 rounded-xl bg-[#2E7CF6] text-white flex items-center justify-center hover:bg-[#1d63d8] disabled:opacity-50" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 h-14 px-4 rounded-full bg-[#2E7CF6] text-white shadow-lg hover:bg-[#1d63d8] transition-all" title="Asistente IA">
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        {!open && <span className="hidden sm:inline font-semibold text-sm pr-1">Asistente IA</span>}
      </button>
    </div>
  );
}
