import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { lineasBase } from "../../lib/calc";
import { formatCurrency, todayISO } from "../../lib/format";
import { Button, Card, Field, Input, Select, Textarea, Label, PageHeader, useToast, Table, Th, Td } from "../../components/ui";

export default function PresupuestoForm() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState(data.clientes[0]?.id || "");
  const [descripcion, setDescripcion] = useState("");
  const [iva, setIva] = useState(data.companySettings.iva_default);
  const [observaciones, setObservaciones] = useState("");
  const [lineas, setLineas] = useState([{ familia: "", concepto: "", cantidad: 1, precio_unitario: 0 }]);

  const base = lineasBase(lineas);
  const ivaImporte = base * (iva / 100);

  function setLinea(i, k, v) {
    setLineas((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }
  const addLinea = () => setLineas((ls) => [...ls, { familia: "", concepto: "", cantidad: 1, precio_unitario: 0 }]);
  const delLinea = (i) => setLineas((ls) => ls.filter((_, idx) => idx !== i));

  function guardar(e) {
    e.preventDefault();
    if (!clienteId || !descripcion) return toast.error("Cliente y descripción son obligatorios.");
    const newId = db.nextId("presupuesto");
    db.update((s) => {
      s.presupuestos.push({
        id: newId, numero_presupuesto: `P-${String(newId).padStart(4, "0")}`,
        cliente_id: Number(clienteId), trabajo_ref: "", descripcion, estado: "pendiente",
        fecha_creacion: todayISO(), iva: Number(iva), observaciones,
        lineas: lineas.map((l) => ({ ...l, cantidad: Number(l.cantidad), precio_unitario: Number(l.precio_unitario) })),
      });
    });
    toast.success("Presupuesto creado");
    navigate("/app/presupuestos");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <PageHeader title="Nuevo Presupuesto" />

      <Card>
        <form onSubmit={guardar} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente" required>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecciona cliente</option>
                {data.clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}
              </Select>
            </Field>
            <Field label="IVA (%)"><Input type="number" value={iva} onChange={(e) => setIva(Number(e.target.value))} /></Field>
          </div>
          <Field label="Descripción" required><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Camisetas evento DTF" /></Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Líneas del presupuesto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLinea}><Plus className="w-3.5 h-3.5" /> Añadir línea</Button>
            </div>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <Table>
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <Th>Familia</Th><Th>Concepto</Th><Th className="w-20">Cant.</Th><Th className="w-28">Precio ud.</Th><Th className="w-24">Subtotal</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <Td><Input value={l.familia} onChange={(e) => setLinea(i, "familia", e.target.value)} className="h-9" placeholder="Familia" /></Td>
                      <Td><Input value={l.concepto} onChange={(e) => setLinea(i, "concepto", e.target.value)} className="h-9" placeholder="Concepto" /></Td>
                      <Td><Input type="number" value={l.cantidad} onChange={(e) => setLinea(i, "cantidad", e.target.value)} className="h-9" /></Td>
                      <Td><Input type="number" step="0.01" value={l.precio_unitario} onChange={(e) => setLinea(i, "precio_unitario", e.target.value)} className="h-9" /></Td>
                      <Td className="font-medium">{formatCurrency(Number(l.cantidad) * Number(l.precio_unitario))}</Td>
                      <Td>{lineas.length > 1 && <button type="button" onClick={() => delLinea(i)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <Field label="Observaciones"><Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500"><span>Base imponible</span><span>{formatCurrency(base)}</span></div>
              <div className="flex justify-between text-slate-500"><span>IVA ({iva}%)</span><span>{formatCurrency(ivaImporte)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1.5 border-t border-slate-100"><span>Total</span><span>{formatCurrency(base + ivaImporte)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">Crear presupuesto</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
