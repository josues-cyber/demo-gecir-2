import { useState } from "react";
import { Plus, Tag, Trash2, ShoppingCart, BadgePercent } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { formatCurrency, formatDate, daysFromNow } from "../../../lib/format";
import { Card, Table, Th, Td, Badge, Button, PageHeader, Modal, Field, Input, EmptyState, useToast } from "../../../components/ui";

// "Ofertas PBS": familia especial del inventario que el distribuidor precarga
// con ofertas para que el cliente final las pida directamente.
export default function OfertasPBS() {
  const data = useDb();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", referencia: "", precio_oferta: "", stock_oferta: "", dias: 30 });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const ofertas = data.ofertasPBS || [];

  function crear() {
    if (!form.nombre || !form.precio_oferta) return toast.error("Nombre y precio de oferta son obligatorios.");
    const id = db.nextId("ofertaPBS");
    db.update((s) => {
      s.ofertasPBS = s.ofertasPBS || [];
      s.ofertasPBS.push({
        id, nombre: form.nombre, referencia: form.referencia || `PBS-${id}`,
        precio_oferta: Number(form.precio_oferta), stock_oferta: Number(form.stock_oferta || 0),
        distribuidor: "REPRISE", vigencia: daysFromNow(Number(form.dias || 30)),
      });
    });
    toast.success("Oferta PBS precargada");
    setOpen(false);
    setForm({ nombre: "", referencia: "", precio_oferta: "", stock_oferta: "", dias: 30 });
  }

  function eliminar(id) {
    db.update((s) => { s.ofertasPBS = s.ofertasPBS.filter((o) => o.id !== id); });
    toast.success("Oferta eliminada");
  }

  function pedir(o) {
    toast.success(`Solicitud enviada al distribuidor: ${o.nombre} a ${formatCurrency(o.precio_oferta)}`);
  }

  return (
    <div>
      <PageHeader
        title="Ofertas PBS"
        subtitle="Ofertas precargadas por tu distribuidor — pídelas con un clic"
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Nueva oferta</Button>}
      />

      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-slate-600 mb-5 flex items-center gap-2">
        <BadgePercent className="w-4 h-4 text-[#2E7CF6] shrink-0" />
        Tu distribuidor precarga aquí ofertas específicas (familia <b className="mx-1">Ofertas PBS</b>). Si necesitas material para un trabajo, pídelo directamente desde tu inventario.
      </div>

      <Card>
        {ofertas.length === 0 ? (
          <EmptyState icon={Tag} title="No hay ofertas activas" hint="Tu distribuidor aún no ha precargado ofertas" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Oferta</Th><Th>Referencia</Th><Th>Distribuidor</Th><Th className="text-right">Stock oferta</Th>
                <Th className="text-right">Precio oferta</Th><Th>Vigencia</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[#2E7CF6]/10 flex items-center justify-center"><Tag className="w-4 h-4 text-[#2E7CF6]" /></span>
                      <span className="font-medium text-slate-800">{o.nombre}</span>
                    </div>
                  </Td>
                  <Td><Badge className="bg-slate-100 text-slate-600 font-mono">{o.referencia}</Badge></Td>
                  <Td className="text-slate-500">{o.distribuidor}</Td>
                  <Td className="text-right text-slate-700">{o.stock_oferta}</Td>
                  <Td className="text-right"><span className="font-semibold text-green-600">{formatCurrency(o.precio_oferta)}</span></Td>
                  <Td className="text-slate-500">Hasta {formatDate(o.vigencia)}</Td>
                  <Td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => pedir(o)} className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7CF6] hover:bg-blue-50 rounded-lg px-2 py-1">
                        <ShoppingCart className="w-3.5 h-3.5" /> Pedir
                      </button>
                      <button onClick={() => eliminar(o.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva oferta PBS" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={crear}>Precargar oferta</Button></>}>
        <div className="space-y-4">
          <Field label="Nombre de la oferta" required><Input value={form.nombre} onChange={set("nombre")} placeholder="Camiseta blanca algodón (M)" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Referencia"><Input value={form.referencia} onChange={set("referencia")} placeholder="REF-1001" /></Field>
            <Field label="Stock de oferta"><Input type="number" value={form.stock_oferta} onChange={set("stock_oferta")} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio oferta (€)" required><Input type="number" step="0.01" value={form.precio_oferta} onChange={set("precio_oferta")} /></Field>
            <Field label="Vigencia (días)"><Input type="number" value={form.dias} onChange={set("dias")} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
