import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Search, Trash2, Package, TrendingUp, DollarSign, AlertTriangle, CheckCircle2,
  MoreVertical, Pencil, BadgePercent,
} from "lucide-react";
import { useDb, db } from "../../lib/store";
import { referenciaFacturacion } from "../../lib/calc";
import { formatCurrency, daysFromNow } from "../../lib/format";
import { Card, Table, Th, Td, Badge, Button, Input, PageHeader, Modal, Field, Select, useToast } from "../../components/ui";
import { TopBarsChart } from "../../components/charts";

const CATEGORIAS = ["Papel", "Consumible", "Acabados", "Gran formato"];
const EMPTY = { codigo: "", nombre: "", categoria: "Papel", stock: 0, precio_venta: "" };

export default function DistribuidorReferencias() {
  const data = useDb();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // "nueva" | "editar" | null
  const [form, setForm] = useState(EMPTY);
  const [oferta, setOferta] = useState(null); // { ref, precio_oferta, stock_oferta, dias }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const refs = data.referencias;
  const rows = useMemo(() => {
    if (!q.trim()) return refs;
    const s = q.toLowerCase();
    return refs.filter((r) => r.nombre.toLowerCase().includes(s) || r.codigo.toLowerCase().includes(s) || r.categoria.toLowerCase().includes(s));
  }, [refs, q]);

  const totalUds = refs.reduce((s, r) => s + r.unidades_vendidas, 0);
  const facturacionTotal = refs.reduce((s, r) => s + referenciaFacturacion(r), 0);
  const sinStock = refs.filter((r) => r.stock === 0).length;
  const topVendidas = refs.slice().sort((a, b) => b.unidades_vendidas - a.unidades_vendidas).slice(0, 5)
    .map((r) => ({ nombre: r.nombre.replace(/\s*\(.*\)/, ""), valor: r.unidades_vendidas }));

  function abrirNueva() { setForm(EMPTY); setModal("nueva"); }
  function abrirEditar(r) { setForm({ ...r }); setModal("editar"); }

  function guardar() {
    if (!form.codigo || !form.nombre) return toast.error("Código y nombre son obligatorios.");
    if (modal === "editar") {
      db.update((s) => {
        Object.assign(s.referencias.find((r) => r.id === form.id), {
          codigo: form.codigo, nombre: form.nombre, categoria: form.categoria,
          stock: Number(form.stock || 0), precio_venta: Number(form.precio_venta || 0),
        });
      });
      toast.success("Referencia actualizada");
    } else {
      const id = db.nextId("referencia");
      db.update((s) => {
        s.referencias.push({
          id, codigo: form.codigo, nombre: form.nombre, categoria: form.categoria,
          stock: Number(form.stock || 0), precio_venta: Number(form.precio_venta || 0), unidades_vendidas: 0,
        });
      });
      toast.success("Referencia añadida");
    }
    setModal(null);
  }

  function eliminar(id) {
    db.update((s) => { s.referencias = s.referencias.filter((r) => r.id !== id); });
    toast.success("Referencia eliminada");
  }

  function abrirOferta(r) {
    setOferta({ ref: r, precio_oferta: "", stock_oferta: Math.min(r.stock, 100), dias: 30 });
  }
  function crearOferta() {
    if (!oferta.precio_oferta) return toast.error("Indica el precio de la oferta.");
    const id = db.nextId("ofertaPBS");
    db.update((s) => {
      s.ofertasPBS = s.ofertasPBS || [];
      s.ofertasPBS.push({
        id, nombre: oferta.ref.nombre, referencia: oferta.ref.codigo,
        precio_oferta: Number(oferta.precio_oferta), stock_oferta: Number(oferta.stock_oferta || 0),
        distribuidor: "REPRISE", vigencia: daysFromNow(Number(oferta.dias || 30)),
      });
    });
    toast.success(`Oferta creada para "${oferta.ref.nombre}" — visible en el inventario del cliente`);
    setOferta(null);
  }

  return (
    <div>
      <PageHeader
        title="Referencias"
        subtitle="Catálogo de productos del distribuidor"
        actions={<Button onClick={abrirNueva}><Plus className="w-4 h-4" /> Nueva referencia</Button>}
      />

      {/* Métricas + gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <MiniStat icon={Package} color="#2E7CF6" value={refs.length} label="Referencias" />
          <MiniStat icon={TrendingUp} color="#10b981" value={`${totalUds.toLocaleString("es-ES")} uds`} label="Unidades vendidas" />
          <MiniStat icon={DollarSign} color="#8b5cf6" value={formatCurrency(facturacionTotal)} label="Facturación acumulada" />
        </div>
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-3">Top referencias por unidades vendidas</h3>
          <TopBarsChart data={topVendidas} formatter={(v) => `${v} uds`} height={200} />
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar referencia, código, categoría..." className="pl-9" />
          </div>
          {sinStock > 0 && <Badge className="bg-red-50 text-red-600"><AlertTriangle className="w-3 h-3" /> {sinStock} sin stock</Badge>}
        </div>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <Th>Referencia</Th><Th>Código</Th><Th>Categoría</Th><Th className="text-right">Stock</Th>
              <Th className="text-right">Precio venta</Th><Th className="text-right">Uds. vendidas</Th><Th className="text-right">Facturación</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <Td className="font-medium text-slate-800">{r.nombre}</Td>
                <Td><Badge className="bg-slate-100 text-slate-600 font-mono">{r.codigo}</Badge></Td>
                <Td className="text-slate-500">{r.categoria}</Td>
                <Td className="text-right">
                  <span className={`inline-flex items-center gap-1 ${r.stock === 0 ? "text-red-600 font-semibold" : "text-slate-700"}`}>
                    {r.stock === 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    {r.stock}
                  </span>
                </Td>
                <Td className="text-right text-slate-700">{formatCurrency(r.precio_venta)}</Td>
                <Td className="text-right text-slate-700">{r.unidades_vendidas.toLocaleString("es-ES")}</Td>
                <Td className="text-right font-semibold text-slate-800">{formatCurrency(referenciaFacturacion(r))}</Td>
                <Td>
                  <RowMenu
                    items={[
                      { label: "Editar", icon: Pencil, onClick: () => abrirEditar(r) },
                      { label: "Crear oferta", icon: BadgePercent, onClick: () => abrirOferta(r) },
                      { label: "Eliminar", icon: Trash2, danger: true, onClick: () => eliminar(r.id) },
                    ]}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Modal crear / editar referencia */}
      <Modal
        open={modal != null}
        onClose={() => setModal(null)}
        title={modal === "editar" ? "Editar referencia" : "Nueva referencia"}
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={guardar}>{modal === "editar" ? "Guardar" : "Añadir"}</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código" required><Input value={form.codigo} onChange={set("codigo")} placeholder="REF-1009" /></Field>
            <Field label="Categoría"><Select value={form.categoria} onChange={set("categoria")}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          </div>
          <Field label="Nombre" required><Input value={form.nombre} onChange={set("nombre")} placeholder="Camiseta azul (M)" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock"><Input type="number" value={form.stock} onChange={set("stock")} /></Field>
            <Field label="Precio venta (€)"><Input type="number" step="0.01" value={form.precio_venta} onChange={set("precio_venta")} /></Field>
          </div>
        </div>
      </Modal>

      {/* Modal crear oferta a partir de una referencia */}
      <Modal
        open={oferta != null}
        onClose={() => setOferta(null)}
        title="Crear oferta"
        footer={<><Button variant="outline" onClick={() => setOferta(null)}>Cancelar</Button><Button onClick={crearOferta}>Crear oferta</Button></>}
      >
        {oferta && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="w-9 h-9 rounded-lg bg-[#2E7CF6]/10 flex items-center justify-center"><BadgePercent className="w-4.5 h-4.5 text-[#2E7CF6]" /></span>
              <div>
                <p className="font-medium text-slate-800">{oferta.ref.nombre}</p>
                <p className="text-xs text-slate-500 font-mono">{oferta.ref.codigo} · precio normal {formatCurrency(oferta.ref.precio_venta)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">La oferta se precarga en la familia <b>Ofertas PBS</b> del inventario de tus clientes.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio oferta (€)" required><Input type="number" step="0.01" value={oferta.precio_oferta} onChange={(e) => setOferta((o) => ({ ...o, precio_oferta: e.target.value }))} /></Field>
              <Field label="Stock de oferta"><Input type="number" value={oferta.stock_oferta} onChange={(e) => setOferta((o) => ({ ...o, stock_oferta: e.target.value }))} /></Field>
            </div>
            <Field label="Vigencia (días)"><Input type="number" value={oferta.dias} onChange={(e) => setOferta((o) => ({ ...o, dias: e.target.value }))} /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MiniStat({ icon: Icon, color, value, label }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

/** Menú de opciones por fila (kebab). Usa posición fija para no recortarse dentro de la tabla. */
function RowMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onScroll() { setOpen(false); }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  function toggle() {
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.right - 176 }); // 176px = ancho w-44
    setOpen((o) => !o);
  }

  return (
    <div className="flex justify-end">
      <button ref={btnRef} onClick={toggle} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Opciones">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div ref={menuRef} className="fixed z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5" style={{ top: pos.top, left: pos.left }}>
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => { setOpen(false); it.onClick(); }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm ${it.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <it.icon className="w-4 h-4" /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
