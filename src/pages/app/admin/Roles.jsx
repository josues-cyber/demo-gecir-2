import { Shield, Users } from "lucide-react";
import { useDb } from "../../../lib/store";
import { Card, Badge, PageHeader } from "../../../components/ui";

export default function AdminRoles() {
  const data = useDb();
  return (
    <div>
      <PageHeader title="Roles" subtitle="Define los permisos de acceso de tu equipo" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.roles.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-9 h-9 rounded-lg bg-[#2E7CF6]/10 flex items-center justify-center"><Shield className="w-4.5 h-4.5 text-[#2E7CF6]" /></span>
              <h3 className="font-semibold text-slate-800">{r.nombre}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">{r.descripcion}</p>
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-slate-100 text-slate-600">{r.permisos === "*" ? "Acceso total" : "Permisos parciales"}</Badge>
              <span className="flex items-center gap-1 text-slate-400"><Users className="w-3.5 h-3.5" /> {r.usuarios} usuarios</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
