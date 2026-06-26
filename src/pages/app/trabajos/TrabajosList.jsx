import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Check, ChevronDown, Briefcase } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { ESTADOS_TRABAJO } from "../../../lib/seed";
import { estadoInfo, procesoInfo } from "../../../lib/calc";
import { formatCurrency, formatDate, todayISO } from "../../../lib/format";
import { Button, Card, Table, Th, Td, Input, Badge, EmptyState, PageHeader, Modal } from "../../../components/ui";
import { useToast } from "../../../components/ui";

const VISTAS = {
  todos: { title: "Todos los Trabajos", subtitle: "Vista completa de todos los trabajos" },
  sin_asignar: { title: "Trabajos Sin Asignar", subtitle: "Trabajos pendientes de asignar a producción" },
  pendientes: { title: "Trabajos Pendientes", subtitle: "Sin asignar, en producción, diseño o acabados" },
  pendiente_presupuesto: { title: "Presupuestar", subtitle: "Trabajos pendientes de presupuesto" },
  produccion: { title: "Trabajos en Producción", subtitle: "Trabajos actualmente en máquina" },
  para_entregar: { title: "Para Entregar", subtitle: "Trabajos listos para entrega al cliente" },
  entregados: { title: "Trabajos Entregados", subtitle: "Historial de completados" },
};

function filtrar(trabajos, vista) {
  switch (vista) {
    case "sin_asignar": return trabajos.filter((t) => t.estado === "sin_asignar");
    case "pendiente_presupuesto": return trabajos.filter((t) => t.estado === "pendiente_presupuesto");
    case "produccion": return trabajos.filter((t) => t.estado === "produccion");
    case "para_entregar": return trabajos.filter((t) => t.estado === "para_entregar");
    case "entregados": return trabajos.filter((t) => ["entregados", "finalizado"].includes(t.estado));
    case "pendientes": return trabajos.filter((t) => !["pendiente_presupuesto", "para_entregar", "entregados", "finalizado"].includes(t.estado));
    default: return trabajos;
  }
}

export default function TrabajosList({ vista }) {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState(null);
  const meta = VISTAS[vista] || VISTAS.todos;

  const clienteById = useMemo(() => Object.fromEntries(data.clientes.map((c) => [c.id, c])), [data.clientes]);

  const rows = useMemo(() => {
    let r = filtrar(data.trabajos, vista);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((t) => {
        const cli = clienteById[t.cliente_id];
        return (
          `#t-${String(t.numero_referencia).padStart(4, "0")}`.includes(s) ||
          String(t.numero_referencia).includes(s) ||
          t.descripcion.toLowerCase().includes(s) ||
          (cli && cli.empresa.toLowerCase().includes(s)) ||
          procesoInfo(t.tipo_proceso).label.toLowerCase().includes(s)
        );
      });
    }
    return r.slice().sort((a, b) => b.numero_referencia - a.numero_referencia);
  }, [data.trabajos, vista, q, clienteById]);

  function cambiarEstado(id, nuevo) {
    db.update((s) => {
      const t = s.trabajos.find((x) => x.id === id);
      if (!t) return;
      t.estado = nuevo;
      if (nuevo === "entregados") t.fecha_entregado = todayISO();
      if (nuevo === "finalizado") t.fecha_finalizado = todayISO();
    });
    toast.success(`Estado cambiado a "${estadoInfo(nuevo).label}"`);
  }

  function eliminar() {
    db.update((s) => { s.trabajos = s.trabajos.filter((t) => t.id !== delId); });
    setDelId(null);
    toast.success("Trabajo eliminado");
  }

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        actions={
          <Button onClick={() => navigate("/app/trabajos/nuevo")}><Plus className="w-4 h-4" /> Nuevo trabajo</Button>
        }
      />

      <Card>
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ref, cliente, descripción..." className="pl-9" />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Briefcase} title="No hay trabajos" hint="Crea un nuevo trabajo para empezar" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Ref.</Th><Th>Cliente</Th><Th>Proceso</Th><Th>Descripción</Th>
                <Th>Estado</Th><Th>Precio</Th><Th>F. Entrada</Th><Th>Entrega est.</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const cli = clienteById[t.cliente_id];
                const pi = procesoInfo(t.tipo_proceso);
                return (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td>
                      <span className={`font-mono font-semibold ${t.pago_adelantado ? "text-red-600" : "text-slate-800"}`}>
                        #T-{String(t.numero_referencia).padStart(4, "0")}
                      </span>
                    </Td>
                    <Td>
                      <p className="font-medium text-slate-800">{cli?.empresa || "—"}</p>
                      {cli?.id_alt && <p className="text-xs text-slate-400">{cli.id_alt}</p>}
                    </Td>
                    <Td><Badge color={pi.color} className="bg-slate-100 text-slate-700">{pi.label}</Badge></Td>
                    <Td className="max-w-[220px]"><span className="line-clamp-1">{t.descripcion}</span></Td>
                    <Td><EstadoSelector value={t.estado} onChange={(e) => cambiarEstado(t.id, e)} /></Td>
                    <Td>{t.precio ? formatCurrency(t.precio) : <span className="text-slate-300">—</span>}</Td>
                    <Td className="text-slate-500">{formatDate(t.fecha_entrada)}</Td>
                    <Td className="text-slate-500">{formatDate(t.ent_estimada)}</Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        {t.estado === "para_entregar" && (
                          <button onClick={() => cambiarEstado(t.id, "entregados")} title="Marcar entregado" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <Link to={`/app/trabajos/${t.id}/editar`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => setDelId(t.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={delId != null}
        onClose={() => setDelId(null)}
        title="Eliminar trabajo"
        footer={<><Button variant="outline" onClick={() => setDelId(null)}>Cancelar</Button><Button variant="danger" onClick={eliminar}>Eliminar</Button></>}
      >
        <p className="text-sm text-slate-600">¿Seguro que quieres eliminar este trabajo? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}

function EstadoSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const info = estadoInfo(value);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ background: info.color }}>
        {info.label} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30">
          {ESTADOS_TRABAJO.map((e) => (
            <button key={e.key} onClick={() => { onChange(e.key); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <span className="w-2 h-2 rounded-full" style={{ background: e.color }} /> {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
