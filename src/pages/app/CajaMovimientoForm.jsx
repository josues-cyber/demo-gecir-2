import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { todayISO } from "../../lib/format";
import { Button, Card, Field, Input, Select, Textarea, Label, PageHeader, useToast } from "../../components/ui";
import { cn } from "../../lib/cn";

const METODOS = ["Efectivo", "Transferencia", "Cheque", "Tarjeta", "Domiciliación"];

export default function CajaMovimientoForm() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("ingreso");
  const [concepto, setConcepto] = useState("");
  const [importe, setImporte] = useState("");
  const [trabajoId, setTrabajoId] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [observaciones, setObservaciones] = useState("");

  function onTrabajo(e) {
    const id = e.target.value;
    setTrabajoId(id);
    const t = data.trabajos.find((x) => x.id === Number(id));
    if (t) {
      setConcepto(`Pago por: #T-${String(t.numero_referencia).padStart(4, "0")} ${t.descripcion}`);
      if (t.precio) setImporte(String(t.precio));
    }
  }

  function guardar(e) {
    e.preventDefault();
    if (!concepto || !importe) return toast.error("Concepto e importe son obligatorios.");
    const newId = db.nextId("movCaja");
    const t = data.trabajos.find((x) => x.id === Number(trabajoId));
    db.update((s) => {
      s.movimientosCaja.push({
        id: newId, tipo, concepto, importe: Number(importe),
        cliente_id: t ? t.cliente_id : null,
        trabajo_ref: t ? `#T-${String(t.numero_referencia).padStart(4, "0")}` : "",
        metodo_pago: metodo, observaciones, fecha: todayISO(),
      });
    });
    toast.success("Movimiento registrado");
    navigate("/app/caja");
  }

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <PageHeader title="Nuevo Movimiento" />

      <Card>
        <form onSubmit={guardar} className="p-6 space-y-5">
          <div>
            <Label className="mb-2">Tipo de movimiento</Label>
            <div className="grid grid-cols-2 gap-3">
              {[["ingreso", "Ingreso", "green"], ["gasto", "Gasto", "red"]].map(([k, label, c]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTipo(k)}
                  className={cn(
                    "h-11 rounded-xl border-2 font-semibold text-sm transition-colors",
                    tipo === k
                      ? c === "green" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Trabajo relacionado (opcional)" hint="Al seleccionar un trabajo se autocompletan concepto e importe">
            <Select value={trabajoId} onChange={onTrabajo}>
              <option value="">— Ninguno —</option>
              {data.trabajos.filter((t) => t.precio > 0).map((t) => (
                <option key={t.id} value={t.id}>#T-{String(t.numero_referencia).padStart(4, "0")} · {t.descripcion}</option>
              ))}
            </Select>
          </Field>

          <Field label="Concepto" required><Textarea rows={2} value={concepto} onChange={(e) => setConcepto(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Importe (€)" required><Input type="number" step="0.01" value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="0.00" /></Field>
            <Field label="Método de pago"><Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>{METODOS.map((m) => <option key={m}>{m}</option>)}</Select></Field>
          </div>
          <Field label="Observaciones"><Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></Field>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
