import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { alertasInventario } from "../../../lib/calc";
import { Card, Button, PageHeader, useToast } from "../../../components/ui";

const TIPO = {
  sin_stock: { label: "Sin Stock", color: "#ef4444", bg: "bg-red-50", border: "border-red-100" },
  stock_bajo: { label: "Stock Bajo", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-100" },
  stock_alto: { label: "Stock Alto", color: "#eab308", bg: "bg-yellow-50", border: "border-yellow-100" },
};

export default function Alertas() {
  const data = useDb();
  const toast = useToast();
  const alertas = alertasInventario(data.productos);

  function resolver(productoId) {
    // En la demo, "marcar como leída" repone el stock al mínimo + 1.
    db.update((s) => {
      const p = s.productos.find((x) => x.id === productoId);
      if (p && p.stock_actual <= p.stock_minimo) p.stock_actual = p.stock_minimo + 1;
    });
    toast.success("Alerta atendida (stock repuesto en la demo)");
  }

  return (
    <div>
      <PageHeader title="Alertas de Stock" subtitle="Productos que requieren atención" />
      {alertas.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No hay alertas pendientes</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => {
            const t = TIPO[a.tipo];
            return (
              <Card key={a.producto.id} className={`p-5 ${t.bg} ${t.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" style={{ color: t.color }} />
                    <div>
                      <p className="font-semibold text-slate-800">{t.label} · {a.producto.nombre}</p>
                      <p className="text-xs text-slate-500">{a.producto.codigo} · Stock actual: {a.producto.stock_actual} (mín {a.producto.stock_minimo})</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => resolver(a.producto.id)}>Marcar como leída</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
