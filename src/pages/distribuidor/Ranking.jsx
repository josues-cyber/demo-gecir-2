import { Trophy, TrendingUp, DollarSign, Briefcase, Medal } from "lucide-react";
import { useDb } from "../../lib/store";
import { distribuidorRankings, referenciaFacturacion } from "../../lib/calc";
import { formatCurrency } from "../../lib/format";
import { Card, PageHeader } from "../../components/ui";

export default function DistribuidorRanking() {
  const data = useDb();
  const r = distribuidorRankings(data);

  return (
    <div>
      <PageHeader title="Rankings" subtitle="Clasificaciones derivadas de tu actividad" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingCard
          icon={Trophy} color="#f59e0b" title="Mejores clientes" sub="Por facturación este mes"
          items={r.mejoresClientes.map((c) => ({ label: c.empresa, value: formatCurrency(c.facturacion_mes) }))}
        />
        <RankingCard
          icon={TrendingUp} color="#10b981" title="Referencias más vendidas" sub="Por unidades"
          items={r.masVendidas.map((x) => ({ label: x.nombre, value: `${x.unidades_vendidas.toLocaleString("es-ES")} uds` }))}
        />
        <RankingCard
          icon={DollarSign} color="#2E7CF6" title="Referencias por facturación" sub="Unidades × precio de venta"
          items={r.mayorFacturacion.map((x) => ({ label: x.nombre, value: formatCurrency(referenciaFacturacion(x)) }))}
        />
        <RankingCard
          icon={Briefcase} color="#8b5cf6" title="Clientes más activos" sub="Por trabajos este mes"
          items={r.masActivos.map((c) => ({ label: c.empresa, value: `${c.trabajos_mes} trabajos` }))}
        />
      </div>
    </div>
  );
}

const MEDAL = ["#f59e0b", "#94a3b8", "#b45309"];

function RankingCard({ icon: Icon, color, title, sub, items }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}1A` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 leading-tight">{title}</h3>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
      </div>
      <ol className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: i < 3 ? `${MEDAL[i]}22` : "#f1f5f9", color: i < 3 ? MEDAL[i] : "#64748b" }}>
                {i < 3 ? <Medal className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className="text-sm text-slate-700 truncate">{it.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 shrink-0 ml-2">{it.value}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
