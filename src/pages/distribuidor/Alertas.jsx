import { AlertTriangle, Mail, Trash2, CheckCircle2, Bell, Package } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { Card, Badge, Button, PageHeader, EmptyState, useToast } from "../../components/ui";

const TIPO = {
  sin_stock: { label: "Sin stock", color: "#ef4444", bg: "bg-red-50", border: "border-red-100", text: "text-red-600" },
  stock_bajo: { label: "Stock bajo", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700" },
};

export default function DistribuidorAlertas() {
  const data = useDb();
  const toast = useToast();
  const alertas = data.alertasDistribuidor || [];
  const sinStock = alertas.filter((a) => a.tipo === "sin_stock").length;

  function contactarTodos() {
    if (alertas.length === 0) return;
    const clientes = new Set(alertas.map((a) => a.empresa));
    toast.success(`Email de reposición enviado a ${clientes.size} cliente(s) · ${alertas.length} referencias`);
  }
  function borrarTodas() {
    if (alertas.length === 0) return;
    db.update((s) => { s.alertasDistribuidor = []; });
    toast.success("Todas las alertas marcadas como atendidas");
  }
  function contactar(a) {
    toast.success(`Email enviado a ${a.empresa} por "${a.referencia}"`);
  }
  function borrar(id) {
    db.update((s) => { s.alertasDistribuidor = s.alertasDistribuidor.filter((a) => a.id !== id); });
    toast.success("Alerta atendida");
  }

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle="Avisos de stock bajo y roturas en tus clientes"
        actions={
          alertas.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={contactarTodos}><Mail className="w-4 h-4" /> Contactar a todos</Button>
              <Button variant="outline" onClick={borrarTodas}><Trash2 className="w-4 h-4" /> Borrar todas</Button>
            </div>
          )
        }
      />

      {/* Resumen */}
      {alertas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <SummaryCard icon={Bell} color="#2E7CF6" value={alertas.length} label="Alertas activas" />
          <SummaryCard icon={AlertTriangle} color="#ef4444" value={sinStock} label="Sin stock" />
          <SummaryCard icon={AlertTriangle} color="#f59e0b" value={alertas.length - sinStock} label="Stock bajo" />
        </div>
      )}

      {alertas.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No hay alertas pendientes</p>
          <p className="text-sm text-slate-400 mt-1">El inventario de tus clientes está al día</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => {
            const t = TIPO[a.tipo] || TIPO.stock_bajo;
            return (
              <Card key={a.id} className={`p-4 ${t.bg} ${t.border}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" style={{ color: t.color }} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className={`${t.bg} ${t.text}`}>{t.label}</Badge>
                        <span className="text-xs text-slate-400 font-mono">{a.codigo}</span>
                      </div>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">{a.referencia}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> {a.empresa} · stock {a.stock_actual} / mín {a.stock_minimo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => contactar(a)} title="Contactar cliente" className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7CF6] hover:bg-white rounded-lg px-2 py-1.5">
                      <Mail className="w-4 h-4" /> Contactar
                    </button>
                    <button onClick={() => borrar(a.id)} title="Borrar alerta" className="p-1.5 rounded-lg text-slate-500 hover:bg-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, color, value, label }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
