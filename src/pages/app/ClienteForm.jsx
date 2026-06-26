import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { todayISO } from "../../lib/format";
import { Button, Card, Field, Input, Textarea, Checkbox, Select, Label, PageHeader, useToast } from "../../components/ui";

const PAISES = ["España", "Portugal", "Francia", "Ecuador", "México", "Colombia"];
const FORMAS_PAGO = ["Transferencia", "Efectivo", "Tarjeta", "Cheque", "Domiciliación", "30 días"];

export default function ClienteForm() {
  const { id } = useParams();
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const editing = !!id;
  const existing = editing ? data.clientes.find((c) => c.id === Number(id)) : null;

  const [form, setForm] = useState(
    existing || {
      empresa: "", id_alt: "", nif: "", direccion: "", codigo_postal: "", ciudad: "", provincia: "", pais: "España",
      tel: "", mail: "", fax: "", contacto: "", cargo: "", telefono_movil: "", web: "",
      forma_pago: "Transferencia", dias_pago: 0, descuento: 0, acreedor: true, observaciones: "",
    }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function guardar(e) {
    e.preventDefault();
    if (!form.empresa) return toast.error("El nombre de la empresa es obligatorio.");
    if (editing) {
      db.update((s) => { Object.assign(s.clientes.find((c) => c.id === Number(id)), form); });
      toast.success("Cliente actualizado");
    } else {
      const newId = db.nextId("cliente");
      db.update((s) => { s.clientes.push({ ...form, id: newId, numero_referencia: newId, created_at: todayISO() }); });
      toast.success("Cliente creado");
    }
    navigate("/app/clientes");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <PageHeader title={editing ? "Editar Cliente" : "Nuevo Cliente"} />

      <Card>
        <form onSubmit={guardar} className="p-6 space-y-6">
          <Section title="Datos básicos">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Empresa" required><Input value={form.empresa} onChange={set("empresa")} /></Field>
              <Field label="ID anterior"><Input value={form.id_alt} onChange={set("id_alt")} /></Field>
              <Field label="NIF / CIF"><Input value={form.nif} onChange={set("nif")} /></Field>
            </div>
          </Section>

          <Section title="Ubicación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Dirección"><Input value={form.direccion} onChange={set("direccion")} /></Field>
              <Field label="Código postal"><Input value={form.codigo_postal} onChange={set("codigo_postal")} /></Field>
              <Field label="Ciudad"><Input value={form.ciudad} onChange={set("ciudad")} /></Field>
              <Field label="Provincia"><Input value={form.provincia} onChange={set("provincia")} /></Field>
              <Field label="País"><Select value={form.pais} onChange={set("pais")}>{PAISES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            </div>
          </Section>

          <Section title="Contacto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Teléfono"><Input value={form.tel} onChange={set("tel")} /></Field>
              <Field label="Móvil"><Input value={form.telefono_movil} onChange={set("telefono_movil")} /></Field>
              <Field label="Email"><Input type="email" value={form.mail} onChange={set("mail")} /></Field>
              <Field label="Contacto"><Input value={form.contacto} onChange={set("contacto")} /></Field>
              <Field label="Cargo"><Input value={form.cargo} onChange={set("cargo")} /></Field>
              <Field label="Web"><Input value={form.web} onChange={set("web")} /></Field>
            </div>
          </Section>

          <Section title="Términos comerciales">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Forma de pago"><Select value={form.forma_pago} onChange={set("forma_pago")}>{FORMAS_PAGO.map((p) => <option key={p}>{p}</option>)}</Select></Field>
              <Field label="Días de pago"><Input type="number" value={form.dias_pago} onChange={set("dias_pago")} /></Field>
              <Field label="Descuento (%)"><Input type="number" value={form.descuento} onChange={set("descuento")} /></Field>
            </div>
            <div className="mt-3">
              <Checkbox label="Cliente acreedor" checked={!!form.acreedor} onChange={(e) => setForm((f) => ({ ...f, acreedor: e.target.checked }))} />
            </div>
            <div className="mt-4">
              <Field label="Observaciones"><Textarea rows={2} value={form.observaciones} onChange={set("observaciones")} /></Field>
            </div>
          </Section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">{editing ? "Guardar cambios" : "Crear cliente"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <Label className="text-slate-800 font-semibold mb-3">{title}</Label>
      {children}
    </div>
  );
}
