import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { PROCESOS } from "../../../lib/seed";
import { todayISO } from "../../../lib/format";
import { Button, Card, Field, Input, Select, Textarea, Checkbox, Label, PageHeader, Modal, useToast } from "../../../components/ui";

const ACABADOS = [
  ["reimpresion", "Reimpresión"], ["numerado", "Numerado"], ["perforado", "Perforado"],
  ["hendido", "Hendido"], ["laminado_brillo", "Laminado brillo"], ["laminado_mate", "Laminado mate"],
  ["laminado_soft", "Laminado soft"],
];

export default function TrabajoForm() {
  const { id } = useParams();
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const editing = !!id;
  const existing = editing ? data.trabajos.find((t) => t.id === Number(id)) : null;

  const [form, setForm] = useState(
    existing || {
      cliente_id: data.clientes[0]?.id || "", descripcion: "", tipo_proceso: "digital",
      cantidad: "", papel: "", acabados: "", ent_estimada: "", observaciones: "",
      precio: "", estado: "sin_asignar",
      reimpresion: false, numerado: false, perforado: false, hendido: false,
      laminado_brillo: false, laminado_mate: false, laminado_soft: false,
    }
  );
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setChk = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  function guardar(e) {
    e.preventDefault();
    if (!form.cliente_id || !form.descripcion || !form.tipo_proceso) {
      return toast.error("Cliente, descripción y proceso son obligatorios.");
    }
    if (editing) {
      db.update((s) => {
        const t = s.trabajos.find((x) => x.id === Number(id));
        Object.assign(t, { ...form, cliente_id: Number(form.cliente_id), precio: Number(form.precio || 0), cantidad: Number(form.cantidad || 0) });
      });
      toast.success("Trabajo actualizado");
    } else {
      const newId = db.nextId("trabajo");
      db.update((s) => {
        s.trabajos.push({
          ...form, id: newId, numero_referencia: newId,
          cliente_id: Number(form.cliente_id), precio: Number(form.precio || 0), cantidad: Number(form.cantidad || 0),
          fecha_entrada: todayISO(), pago_adelantado: false,
        });
      });
      toast.success("Trabajo creado");
    }
    navigate("/app/trabajos");
  }

  function crearCliente(nombre) {
    const newId = db.nextId("cliente");
    db.update((s) => {
      s.clientes.push({ id: newId, numero_referencia: newId, empresa: nombre, id_alt: "", nif: "", direccion: "", ciudad: "", pais: "España", tel: "", mail: "", contacto: "", forma_pago: "", dias_pago: 0, descuento: 0, acreedor: true, created_at: todayISO() });
    });
    setForm((f) => ({ ...f, cliente_id: newId }));
    setNuevoCliente(false);
    toast.success("Cliente creado y seleccionado");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <PageHeader title={editing ? "Editar Trabajo" : "Nuevo Trabajo"} subtitle={editing ? `#T-${String(existing?.numero_referencia).padStart(4, "0")}` : "Crea un nuevo trabajo de imprenta"} />

      <Card>
        <form onSubmit={guardar} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Select value={form.cliente_id} onChange={set("cliente_id")} className="flex-1">
                  <option value="">Selecciona cliente</option>
                  {data.clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}
                </Select>
                <Button type="button" variant="outline" onClick={() => setNuevoCliente(true)} className="px-3"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <Field label="Tipo de proceso" required>
              <Select value={form.tipo_proceso} onChange={set("tipo_proceso")}>
                {PROCESOS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Descripción" required>
            <Input value={form.descripcion} onChange={set("descripcion")} placeholder="Ej: Tarjetas de visita premium" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Cantidad"><Input type="number" value={form.cantidad} onChange={set("cantidad")} placeholder="0" /></Field>
            <Field label="Papel / Soporte"><Input value={form.papel} onChange={set("papel")} placeholder="Ej: Couché 300g" /></Field>
            <Field label="Precio (€)"><Input type="number" step="0.01" value={form.precio} onChange={set("precio")} placeholder="0.00" /></Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Entrega estimada"><Input type="date" value={form.ent_estimada ? form.ent_estimada.slice(0, 10) : ""} onChange={(e) => setForm((f) => ({ ...f, ent_estimada: e.target.value }))} /></Field>
            <Field label="Acabados (texto)"><Input value={form.acabados} onChange={set("acabados")} placeholder="Ej: Plastificado mate" /></Field>
          </div>

          <div>
            <Label className="mb-2">Opciones de acabado</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACABADOS.map(([k, label]) => (
                <Checkbox key={k} label={label} checked={!!form[k]} onChange={setChk(k)} />
              ))}
            </div>
          </div>

          <Field label="Observaciones"><Textarea rows={3} value={form.observaciones} onChange={set("observaciones")} /></Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">{editing ? "Guardar cambios" : "Crear trabajo"}</Button>
          </div>
        </form>
      </Card>

      <NuevoClienteModal open={nuevoCliente} onClose={() => setNuevoCliente(false)} onCreate={crearCliente} />
    </div>
  );
}

function NuevoClienteModal({ open, onClose, onCreate }) {
  const [nombre, setNombre] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cliente rápido"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => nombre && onCreate(nombre)}>Crear</Button></>}
    >
      <Field label="Nombre de la empresa" required>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mi Cliente S.L." autoFocus />
      </Field>
    </Modal>
  );
}
