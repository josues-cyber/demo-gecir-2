import { Link } from "react-router-dom";
import { Users, Clock, Package, TrendingUp, Briefcase, Calculator, ArrowRight } from "lucide-react";
import { useDb } from "../../lib/store";
import { trabajosStats, cajaResumen } from "../../lib/calc";
import { formatCurrency } from "../../lib/format";
import { Card } from "../../components/ui";

export default function Dashboard() {
  const data = useDb();
  const stats = trabajosStats(data.trabajos);
  const caja = cajaResumen(data.movimientosCaja);

  const cards = [
    { icon: Users, color: "#2E7CF6", label: "Total clientes", value: data.clientes.length, to: "/app/clientes", link: "Ver clientes" },
    { icon: Clock, color: "#f59e0b", label: "Trabajos pendientes", value: stats.pendientes, to: "/app/trabajos/pendientes", link: "Ver pendientes" },
    { icon: Package, color: "#8b5cf6", label: "Para entregar", value: stats.para_entregar, to: "/app/trabajos/para-entregar", link: "Ver para entregar" },
    { icon: TrendingUp, color: caja.saldo >= 0 ? "#10b981" : "#ef4444", label: "Balance", value: formatCurrency(caja.saldo), to: "/app/caja", link: "Ver caja" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Panel de control</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de tu actividad · {data.companySettings.nombre_empresa}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}1A` }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
            <Link to={c.to} className="inline-flex items-center gap-1 text-xs text-[#2E7CF6] mt-2 font-medium">
              {c.link} <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickCard icon={Users} color="#2E7CF6" title="Clientes" items={[
          { label: "Ver todos los clientes", to: "/app/clientes" },
          { label: "Nuevo cliente", to: "/app/clientes/nuevo" },
        ]} />
        <QuickCard icon={Briefcase} color="#f59e0b" title="Trabajos" items={[
          { label: `Sin asignar (${stats.sin_asignar})`, to: "/app/trabajos/sin-asignar" },
          { label: `Para entregar (${stats.para_entregar})`, to: "/app/trabajos/para-entregar" },
          { label: `Entregados (${stats.entregados})`, to: "/app/trabajos/entregados" },
        ]} />
        <QuickCard icon={Package} color="#8b5cf6" title="Inventario" items={[
          { label: "Dashboard", to: "/app/inventario" },
          { label: "Ver productos", to: "/app/inventario/productos" },
          { label: "Nuevo producto", to: "/app/inventario/productos/nuevo" },
        ]} />
        <QuickCard icon={Calculator} color="#10b981" title="Financiero" items={[
          { label: `Ingresos: ${formatCurrency(caja.ingresos)}`, to: "/app/caja" },
          { label: `Gastos: ${formatCurrency(caja.gastos)}`, to: "/app/caja" },
          { label: "Ver caja", to: "/app/caja" },
        ]} />
      </div>
    </div>
  );
}

function QuickCard({ icon: Icon, color, title, items }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}1A` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link to={it.to} className="text-sm text-slate-600 hover:text-[#2E7CF6]">{it.label}</Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
