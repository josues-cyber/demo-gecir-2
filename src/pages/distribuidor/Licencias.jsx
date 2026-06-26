import { useState } from "react";
import { Copy, KeyRound, Check } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { formatDate, daysFromNow } from "../../lib/format";
import { Card, Table, Th, Td, Badge, Button, PageHeader, Modal, Field, Input, useToast } from "../../components/ui";

const ESTADO = {
  disponible: { label: "Disponible", color: "#94a3b8", cls: "bg-slate-100 text-slate-600" },
  asignada: { label: "Asignada", color: "#eab308", cls: "bg-yellow-50 text-yellow-700" },
  activa: { label: "Activa", color: "#22c55e", cls: "bg-green-50 text-green-700" },
  inactiva: { label: "Inactiva", color: "#ef4444", cls: "bg-red-50 text-red-600" },
};

export default function DistribuidorLicencias() {
  const data = useDb();
  const toast = useToast();
  const [asignar, setAsignar] = useState(null); // licencia a asignar
  const [email, setEmail] = useState("");
  const [copiada, setCopiada] = useState(null);

  const counts = {
    disponible: data.licencias.filter((l) => l.estado === "disponible").length,
    asignada: data.licencias.filter((l) => l.estado === "asignada").length,
    activa: data.licencias.filter((l) => l.estado === "activa").length,
    inactiva: data.licencias.filter((l) => l.estado === "inactiva").length,
  };

  function copiar(key) {
    navigator.clipboard?.writeText(key);
    setCopiada(key);
    setTimeout(() => setCopiada(null), 1500);
  }

  function confirmarAsignar() {
    if (!email) return toast.error("Introduce el email del cliente.");
    db.update((s) => {
      const l = s.licencias.find((x) => x.id === asignar.id);
      l.estado = "asignada"; l.email = email; l.db_status = "PENDING";
    });
    toast.success(`Invitación enviada a ${email}`);
    setAsignar(null); setEmail("");
  }

  function cambiarEstado(id, estado) {
    db.update((s) => {
      const l = s.licencias.find((x) => x.id === id);
      l.estado = estado;
      l.pausada = estado === "inactiva";
      if (estado === "activa" && !l.vencimiento) l.vencimiento = daysFromNow(365);
    });
    toast.success(estado === "activa" ? "Licencia reactivada" : "Licencia desactivada");
  }

  return (
    <div>
      <PageHeader title="Mis licencias" subtitle="Gestiona el pool de licencias asignadas a tus clientes" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PoolStat color="#94a3b8" value={counts.disponible} label="Disponibles" />
        <PoolStat color="#eab308" value={counts.asignada} label="Asignadas" />
        <PoolStat color="#22c55e" value={counts.activa} label="Activas" />
        <PoolStat color="#ef4444" value={counts.inactiva} label="Inactivas" />
      </div>

      <Card>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Clave</Th><Th>Estado</Th><Th>Email asignado</Th><Th>Empresa</Th><Th>Vencimiento</Th><Th>Acciones</Th></tr>
          </thead>
          <tbody>
            {data.licencias.map((l) => {
              const e = ESTADO[l.estado];
              return (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <Td>
                    <button onClick={() => copiar(l.license_key)} className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-[#2E7CF6]">
                      {l.license_key} {copiada === l.license_key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </Td>
                  <Td><Badge color={e.color} className={e.cls}>{e.label}</Badge></Td>
                  <Td className="text-slate-600">{l.email || <span className="text-slate-300">—</span>}</Td>
                  <Td className="text-slate-600">{l.empresa || <span className="text-slate-300">—</span>}</Td>
                  <Td className="text-slate-500">{l.vencimiento ? formatDate(l.vencimiento) : "—"}</Td>
                  <Td>
                    {l.estado === "disponible" && <Button size="sm" onClick={() => setAsignar(l)}>Asignar</Button>}
                    {l.estado === "asignada" && <span className="text-xs text-slate-400">Pendiente registro</span>}
                    {l.estado === "activa" && <Button size="sm" variant="outline" onClick={() => cambiarEstado(l.id, "inactiva")}>Desactivar</Button>}
                    {l.estado === "inactiva" && <Button size="sm" variant="success" onClick={() => cambiarEstado(l.id, "activa")}>Reactivar</Button>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={asignar != null}
        onClose={() => setAsignar(null)}
        title="Asignar licencia"
        footer={<><Button variant="outline" onClick={() => setAsignar(null)}>Cancelar</Button><Button onClick={confirmarAsignar}>Enviar invitación</Button></>}
      >
        <p className="text-sm text-slate-500 mb-4">
          Clave <span className="font-mono text-slate-700">{asignar?.license_key}</span>. Se enviará un email de invitación al cliente con su clave de activación.
        </p>
        <Field label="Email del cliente" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@empresa.com" autoFocus />
        </Field>
      </Modal>
    </div>
  );
}

function PoolStat({ color, value, label }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  );
}
