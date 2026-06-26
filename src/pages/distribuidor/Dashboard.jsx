import { Link } from "react-router-dom";
import {
  Users, Briefcase, AlertTriangle, TrendingUp, TrendingDown, DollarSign,
  Trophy, ArrowUpRight, ArrowDownRight, Package, ArrowRight,
} from "lucide-react";
import { useDb } from "../../lib/store";
import { distribuidorMetrics, referenciaFacturacion } from "../../lib/calc";
import { formatCurrency } from "../../lib/format";
import { Card, PageHeader, Badge } from "../../components/ui";
import { FacturacionChart, TopBarsChart, CompareBars } from "../../components/charts";

export default function DistribuidorDashboard() {
  const data = useDb();
  const m = distribuidorMetrics(data);

  const topRefs = data.referencias
    .slice().sort((a, b) => b.unidades_vendidas - a.unidades_vendidas).slice(0, 5)
    .map((r) => ({ nombre: r.nombre.replace(/\s*\(.*\)/, ""), valor: r.unidades_vendidas }));

  const topFact = data.referencias
    .slice().sort((a, b) => referenciaFacturacion(b) - referenciaFacturacion(a)).slice(0, 5)
    .map((r) => ({ nombre: r.nombre.replace(/\s*\(.*\)/, ""), valor: Math.round(referenciaFacturacion(r)) }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visión global del negocio · panel ejecutivo" />

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          icon={DollarSign} color="#10b981"
          value={formatCurrency(m.facturacionMes)} label="Facturación este mes"
          delta={m.facturacionPct} deltaLabel="vs. mes anterior"
        />
        <KpiCard
          icon={Briefcase} color="#2E7CF6"
          value={m.trabajosMes} label="Trabajos este mes"
          delta={m.trabajosPct} deltaLabel="vs. mes anterior"
        />
        <KpiCard
          icon={Users} color="#8b5cf6"
          value={m.clientesActivos} label="Clientes activos"
          sub={`${m.clientesInactivos} inactivos`}
        />
        <KpiCard
          icon={AlertTriangle} color="#f59e0b"
          value={m.alertasStock} label="Alertas de stock"
          sub="Requieren atención"
        />
      </div>

      {/* Destacados (mejor cliente / referencia top / menos vendida) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <HighlightCard
          icon={Trophy} color="#f59e0b" label="Mejor cliente"
          title={m.mejorCliente?.empresa} value={formatCurrency(m.mejorCliente?.facturacion_mes || 0)} valueLabel="facturado este mes"
        />
        <HighlightCard
          icon={TrendingUp} color="#10b981" label="Referencia más vendida"
          title={m.refMasVendida?.nombre} value={`${m.refMasVendida?.unidades_vendidas} uds`} valueLabel={m.refMasVendida?.codigo}
        />
        <HighlightCard
          icon={TrendingDown} color="#ef4444" label="Referencia menos vendida"
          title={m.refMenosVendida?.nombre} value={`${m.refMenosVendida?.unidades_vendidas} uds`} valueLabel={m.refMenosVendida?.codigo}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Evolutivo de facturación</h3>
            <Badge className="bg-green-50 text-green-700"><ArrowUpRight className="w-3 h-3" /> +{m.facturacionPct}% este mes</Badge>
          </div>
          <FacturacionChart data={data.facturacionMensual} formatter={(v) => formatCurrency(v)} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Trabajos: mes actual vs. anterior</h3>
          <CompareBars
            data={[
              { label: "Mes anterior", valor: m.trabajosMesAnterior },
              { label: "Este mes", valor: m.trabajosMes },
            ]}
          />
          <p className="text-center text-sm text-slate-500 mt-2">
            <span className={m.trabajosPct >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {m.trabajosPct >= 0 ? "+" : ""}{m.trabajosPct}%
            </span>{" "}respecto al mes pasado
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Top referencias por unidades vendidas</h3>
          <TopBarsChart data={topRefs} color="#2E7CF6" formatter={(v) => `${v} uds`} />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Top referencias por facturación</h3>
          <TopBarsChart data={topFact} color="#10b981" formatter={(v) => formatCurrency(v)} />
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="flex flex-wrap gap-3">
        <QuickLink to="/distribuidor/clientes" icon={Users} label="Ver clientes" />
        <QuickLink to="/distribuidor/referencias" icon={Package} label="Gestionar referencias" />
        <QuickLink to="/distribuidor/ranking" icon={Trophy} label="Ver rankings" />
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, color, value, label, sub, delta, deltaLabel }) {
  const up = delta >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1A` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{up ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {(sub || deltaLabel) && <p className="text-xs text-slate-400 mt-0.5">{sub || deltaLabel}</p>}
    </Card>
  );
}

function HighlightCard({ icon: Icon, color, label, title, value, valueLabel }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      </div>
      <p className="font-semibold text-slate-800 truncate">{title || "—"}</p>
      <p className="text-lg font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-400">{valueLabel}</p>
    </Card>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-[#2E7CF6] hover:text-[#2E7CF6]">
      <Icon className="w-4 h-4" /> {label} <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );
}
