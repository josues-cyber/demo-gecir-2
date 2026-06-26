import { useState } from "react";
import { Database, CheckCircle2, Pause, Play, RefreshCw } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { formatDate, daysFromNow } from "../../../lib/format";
import { Card, Table, Th, Td, Badge, Button, PageHeader, Modal, useToast } from "../../../components/ui";
import { cn } from "../../../lib/cn";

export default function AdminLicencias() {
  const data = useDb();
  const toast = useToast();
  const [tab, setTab] = useState("pendientes");
  const [activando, setActivando] = useState(null);
  const [progreso, setProgreso] = useState(null);

  const pendientes = data.solicitudes;
  const activas = data.licencias.filter((l) => l.estado === "activa");
  const inactivas = data.licencias.filter((l) => l.estado === "inactiva");

  const tabs = [
    { key: "pendientes", label: "Pendientes", count: pendientes.length, color: "#eab308" },
    { key: "activas", label: "Activas", count: activas.length, color: "#22c55e" },
    { key: "inactivas", label: "Pausadas / Inactivas", count: inactivas.length, color: "#ef4444" },
  ];

  function activar(sol) {
    setActivando(null);
    setProgreso({ empresa: sol.empresa, step: "CREATING" });
    setTimeout(() => setProgreso((p) => ({ ...p, step: "SEEDING" })), 1200);
    setTimeout(() => {
      const newId = db.nextId("usuario") + 100;
      db.update((s) => {
        s.solicitudes = s.solicitudes.filter((x) => x.id !== sol.id);
        s.licencias.push({
          id: 1000 + sol.id, license_key: sol.license_key.replace("PENDIENTE", "ACTIVA"),
          estado: "activa", email: sol.email, empresa: sol.empresa, proveedor: sol.proveedor,
          vencimiento: daysFromNow(365), almacenamiento_mb: 0, db_status: "READY", pausada: false,
        });
      });
      setProgreso(null);
      toast.success(`${sol.empresa} activada · base de datos creada (READY)`);
    }, 2600);
  }

  function pausar(id) {
    db.update((s) => { const l = s.licencias.find((x) => x.id === id); l.estado = "inactiva"; l.pausada = true; });
    toast.success("Licencia pausada");
  }
  function reanudar(id) {
    db.update((s) => { const l = s.licencias.find((x) => x.id === id); l.estado = "activa"; l.pausada = false; });
    toast.success("Licencia reanudada");
  }
  function renovar(id) {
    db.update((s) => { const l = s.licencias.find((x) => x.id === id); l.vencimiento = daysFromNow(365); });
    toast.success("Licencia renovada 12 meses");
  }

  return (
    <div>
      <PageHeader title="Gestión de Licencias" subtitle="Administra las licencias y bases de datos de los clientes" />

      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border", tab === t.key ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "border-transparent text-slate-500 hover:bg-white/60")}>
            <span className="w-2 h-2 rounded-full" style={{ background: t.color }} /> {t.label}
            <span className="bg-slate-100 text-slate-600 rounded-full px-1.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      <Card>
        {tab === "pendientes" && (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Empresa</Th><Th>Email</Th><Th>License key</Th><Th>País</Th><Th>Estado</Th><Th>BD</Th><Th></Th></tr>
            </thead>
            <tbody>
              {pendientes.length === 0 && <tr><Td colSpan={7} className="text-center text-slate-400 py-8">No hay solicitudes pendientes</Td></tr>}
              {pendientes.map((s) => (
                <tr key={s.id} className="border-b border-slate-50">
                  <Td className="font-medium text-slate-800">{s.empresa}</Td>
                  <Td className="text-slate-600">{s.email}</Td>
                  <Td className="font-mono text-xs text-slate-500">{s.license_key}</Td>
                  <Td className="text-slate-500">{s.pais}</Td>
                  <Td><Badge className="bg-yellow-50 text-yellow-700">{s.estado === "verified" ? "Verificado" : "Pendiente verif."}</Badge></Td>
                  <Td><Badge className="bg-slate-100 text-slate-500"><Database className="w-3 h-3" /> {s.db_status}</Badge></Td>
                  <Td><Button size="sm" variant="success" onClick={() => setActivando(s)}>Activar</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {(tab === "activas" || tab === "inactivas") && (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Empresa</Th><Th>Email</Th><Th>License key</Th><Th>Estado</Th><Th>Vencimiento</Th><Th>Almacen.</Th><Th>BD</Th><Th>Acciones</Th></tr>
            </thead>
            <tbody>
              {(tab === "activas" ? activas : inactivas).map((l) => (
                <tr key={l.id} className="border-b border-slate-50">
                  <Td className="font-medium text-slate-800">{l.empresa}</Td>
                  <Td className="text-slate-600">{l.email}</Td>
                  <Td className="font-mono text-xs text-slate-500">{l.license_key}</Td>
                  <Td><Badge color={l.estado === "activa" ? "#22c55e" : "#ef4444"} className={l.estado === "activa" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}>{l.estado === "activa" ? "Activa" : "Pausada"}</Badge></Td>
                  <Td className="text-slate-500">{l.vencimiento ? formatDate(l.vencimiento) : "—"}</Td>
                  <Td className="text-slate-500">{l.almacenamiento_mb} MB</Td>
                  <Td><Badge className="bg-green-50 text-green-700"><Database className="w-3 h-3" /> {l.db_status}</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      {l.estado === "activa" ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => pausar(l.id)}><Pause className="w-3.5 h-3.5" /> Pausar</Button>
                          <Button size="sm" variant="ghost" onClick={() => renovar(l.id)}><RefreshCw className="w-3.5 h-3.5" /> Renovar</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => reanudar(l.id)}><Play className="w-3.5 h-3.5" /> Reanudar</Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Confirmación activar */}
      <Modal
        open={activando != null}
        onClose={() => setActivando(null)}
        title="Activar licencia"
        footer={<><Button variant="outline" onClick={() => setActivando(null)}>Cancelar</Button><Button variant="success" onClick={() => activar(activando)}>Activar y generar BD</Button></>}
      >
        <p className="text-sm text-slate-600">
          Se generará automáticamente una base de datos aislada para <b>{activando?.empresa}</b> y la licencia quedará
          activa con 12 meses de validez.
        </p>
      </Modal>

      {/* Progreso creación BD */}
      <Modal open={progreso != null} onClose={() => {}} title="Generando base de datos">
        <div className="text-center py-4">
          <RefreshCw className="w-8 h-8 text-[#2E7CF6] animate-spin mx-auto mb-3" />
          <p className="font-medium text-slate-800">{progreso?.empresa}</p>
          <p className="text-sm text-slate-500 mt-1">
            {progreso?.step === "CREATING" ? "Creando base de datos del cliente..." : "Cargando estructura y datos iniciales..."}
          </p>
        </div>
      </Modal>
    </div>
  );
}
