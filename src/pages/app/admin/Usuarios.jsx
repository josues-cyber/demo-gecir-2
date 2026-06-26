import { useState } from "react";
import { Plus, Edit, Power } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { formatDate, formatDateTime, todayISO } from "../../../lib/format";
import { Card, Table, Th, Td, Badge, Button, PageHeader, Modal, Field, Input, Select, useToast } from "../../../components/ui";

export default function AdminUsuarios() {
  const data = useDb();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", rol: "Empleado", password: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function toggleActivo(id) {
    db.update((s) => { const u = s.usuarios.find((x) => x.id === id); u.activo = !u.activo; });
    toast.success("Estado del usuario actualizado");
  }

  function crear() {
    if (!form.email || !form.nombre) return toast.error("Nombre y email son obligatorios.");
    const newId = db.nextId("usuario");
    db.update((s) => { s.usuarios.push({ id: newId, ...form, activo: true, ultimo_acceso: null, created_at: todayISO() }); });
    toast.success("Usuario creado");
    setOpen(false); setForm({ nombre: "", apellidos: "", email: "", rol: "Empleado", password: "" });
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona los usuarios de tu empresa"
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Nuevo usuario</Button>}
      />
      <Card>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Usuario</Th><Th>Email</Th><Th>Rol</Th><Th>Estado</Th><Th>Último acceso</Th><Th>Registro</Th><Th></Th></tr>
          </thead>
          <tbody>
            {data.usuarios.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#2E7CF6]/10 text-[#2E7CF6] flex items-center justify-center text-xs font-semibold">
                      {u.nombre[0]}{u.apellidos?.[0] || ""}
                    </span>
                    <span className="font-medium text-slate-800">{u.nombre} {u.apellidos}</span>
                  </div>
                </Td>
                <Td className="text-slate-600">{u.email}</Td>
                <Td><Badge className="bg-slate-100 text-slate-700">{u.rol}</Badge></Td>
                <Td><Badge color={u.activo ? "#22c55e" : "#ef4444"} className={u.activo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}>{u.activo ? "Activo" : "Inactivo"}</Badge></Td>
                <Td className="text-slate-500">{u.ultimo_acceso ? formatDateTime(u.ultimo_acceso) : "—"}</Td>
                <Td className="text-slate-500">{formatDate(u.created_at)}</Td>
                <Td>
                  <button onClick={() => toggleActivo(u.id)} title={u.activo ? "Desactivar" : "Activar"} className={`p-1.5 rounded-lg hover:bg-slate-100 ${u.activo ? "text-red-500" : "text-green-600"}`}>
                    <Power className="w-4 h-4" />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo usuario" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={crear}>Crear</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required><Input value={form.nombre} onChange={set("nombre")} /></Field>
            <Field label="Apellidos"><Input value={form.apellidos} onChange={set("apellidos")} /></Field>
          </div>
          <Field label="Email" required><Input type="email" value={form.email} onChange={set("email")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rol"><Select value={form.rol} onChange={set("rol")}>{data.roles.map((r) => <option key={r.id}>{r.nombre}</option>)}</Select></Field>
            <Field label="Contraseña"><Input type="password" value={form.password} onChange={set("password")} placeholder="Mín. 6 caracteres" /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
