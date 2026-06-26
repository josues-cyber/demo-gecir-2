import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, Check, X, FileText, ArrowRightCircle, Trash2 } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { docTotales } from "../../lib/calc";
import { formatCurrency, formatDate, todayISO } from "../../lib/format";
import { Button, Card, Table, Th, Td, Badge, EmptyState, PageHeader, useToast } from "../../components/ui";

const ESTADO_BADGE = {
  pendiente: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  enviado: { label: "Enviado", cls: "bg-blue-100 text-blue-700" },
  aprobado: { label: "Aprobado", cls: "bg-green-100 text-green-700" },
  rechazado: { label: "Rechazado", cls: "bg-red-100 text-red-600" },
  facturado: { label: "Facturado", cls: "bg-slate-200 text-slate-600" },
};

export default function Presupuestos() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const clienteById = useMemo(() => Object.fromEntries(data.clientes.map((c) => [c.id, c])), [data.clientes]);
  const rows = data.presupuestos.slice().sort((a, b) => b.id - a.id);

  function setEstado(id, estado) {
    db.update((s) => { s.presupuestos.find((p) => p.id === id).estado = estado; });
    toast.success(`Presupuesto marcado como ${ESTADO_BADGE[estado].label.toLowerCase()}`);
  }

  function convertirAlbaran(p) {
    const newId = db.nextId("albaran");
    db.update((s) => {
      s.albaranes.push({
        id: newId, numero_albaran: `A-${String(newId).padStart(4, "0")}`,
        cliente_id: p.cliente_id, presupuesto_id: p.id, numero_presupuesto: p.numero_presupuesto,
        trabajo_descripcion: p.descripcion, estado_trabajo: "produccion", estado: "pendiente",
        fecha_albaran: todayISO(), iva: p.iva, lineas: p.lineas.map((l) => ({ concepto: l.concepto, cantidad: l.cantidad, precio_unitario: l.precio_unitario })),
      });
      s.presupuestos.find((x) => x.id === p.id).estado = "facturado";
    });
    toast.success(`Albarán A-${String(newId).padStart(4, "0")} generado`);
    navigate("/app/albaranes");
  }

  function eliminar(id) {
    db.update((s) => { s.presupuestos = s.presupuestos.filter((p) => p.id !== id); });
    toast.success("Presupuesto eliminado");
  }

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        subtitle="Gestiona los presupuestos de tus clientes"
        actions={<Button onClick={() => navigate("/app/presupuestos/nuevo")}><Plus className="w-4 h-4" /> Nuevo presupuesto</Button>}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={FileText} title="No hay presupuestos" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Número</Th><Th>Cliente</Th><Th>Descripción</Th><Th>Estado</Th><Th>Fecha</Th><Th>Total</Th><Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cli = clienteById[p.cliente_id];
                const { total } = docTotales(p);
                const b = ESTADO_BADGE[p.estado];
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td><span className="font-mono font-semibold text-slate-800">{p.numero_presupuesto}</span></Td>
                    <Td className="font-medium text-slate-700">{cli?.empresa || "—"}</Td>
                    <Td className="max-w-[200px]"><span className="line-clamp-1">{p.descripcion}</span></Td>
                    <Td><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span></Td>
                    <Td className="text-slate-500">{formatDate(p.fecha_creacion)}</Td>
                    <Td className="font-semibold text-slate-800">{formatCurrency(total)}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        {p.estado === "pendiente" && (
                          <IconBtn title="Marcar enviado" color="text-blue-600" onClick={() => setEstado(p.id, "enviado")}><Send className="w-4 h-4" /></IconBtn>
                        )}
                        {["pendiente", "enviado"].includes(p.estado) && (
                          <>
                            <IconBtn title="Aprobar" color="text-green-600" onClick={() => setEstado(p.id, "aprobado")}><Check className="w-4 h-4" /></IconBtn>
                            <IconBtn title="Rechazar" color="text-red-600" onClick={() => setEstado(p.id, "rechazado")}><X className="w-4 h-4" /></IconBtn>
                          </>
                        )}
                        {p.estado === "aprobado" && (
                          <button onClick={() => convertirAlbaran(p)} className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7CF6] hover:bg-blue-50 rounded-lg px-2 py-1">
                            <ArrowRightCircle className="w-4 h-4" /> Pasar a albarán
                          </button>
                        )}
                        <IconBtn title="Eliminar" color="text-red-500" onClick={() => eliminar(p.id)}><Trash2 className="w-4 h-4" /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function IconBtn({ children, title, color, onClick }) {
  return (
    <button title={title} onClick={onClick} className={`p-1.5 rounded-lg hover:bg-slate-100 ${color}`}>{children}</button>
  );
}
