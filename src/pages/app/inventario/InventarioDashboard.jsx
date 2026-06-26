import { Link } from "react-router-dom";
import { Package, AlertTriangle, DollarSign, Bell, TrendingUp, TrendingDown, Settings2 } from "lucide-react";
import { useDb } from "../../../lib/store";
import { inventarioStats } from "../../../lib/calc";
import { formatCurrency, formatDate } from "../../../lib/format";
import { Card, Table, Th, Td, Badge, PageHeader } from "../../../components/ui";

export default function InventarioDashboard() {
  const data = useDb();
  const stats = inventarioStats(data.productos);
  const recientes = data.movimientosInventario.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard de Inventario" subtitle="Gestiona tu inventario de forma eficiente" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} color="#2E7CF6" value={stats.total} label="Total productos" sub={`En ${data.categorias.length} categorías`} />
        <StatCard icon={AlertTriangle} color="#f59e0b" value={stats.stockBajo} label="Stock bajo" sub={`${stats.sinStock} sin stock`} />
        <StatCard icon={DollarSign} color="#10b981" value={formatCurrency(stats.valorTotal)} label="Valor total" sub="Valor del inventario" />
        <StatCard icon={Bell} color="#ef4444" value={stats.alertas} label="Alertas activas" sub="Requieren atención" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <QuickCard icon={Package} title="Gestión de productos" links={[["Ver todos los productos", "/app/inventario/productos"], ["Agregar producto", "/app/inventario/productos/nuevo"]]} />
        <QuickCard icon={TrendingUp} title="Movimientos" links={[["Ver movimientos", "/app/inventario/movimientos"], ["Nuevo movimiento", "/app/inventario/movimientos"]]} />
        <QuickCard icon={Settings2} title="Alertas y control" links={[[`Ver alertas (${stats.alertas})`, "/app/inventario/alertas"], ["Gestionar categorías", "/app/inventario/categorias"]]} />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Movimientos recientes</h3></div>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Tipo</Th><Th>Producto</Th><Th>Concepto</Th><Th>Fecha</Th><Th className="text-right">Cantidad</Th></tr>
          </thead>
          <tbody>
            {recientes.map((m) => {
              const entrada = m.tipo === "entrada";
              const ajuste = m.tipo === "ajuste";
              return (
                <tr key={m.id} className="border-b border-slate-50">
                  <Td>
                    <Badge className={entrada ? "bg-green-100 text-green-700" : ajuste ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-600"}>
                      {entrada ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {entrada ? "Entrada" : ajuste ? "Ajuste" : "Salida"}
                    </Badge>
                  </Td>
                  <Td className="font-medium text-slate-700">{m.producto}</Td>
                  <Td className="text-slate-500">{m.motivo}</Td>
                  <Td className="text-slate-500">{formatDate(m.fecha)}</Td>
                  <Td className={`text-right font-semibold ${entrada ? "text-green-600" : "text-red-600"}`}>{entrada ? "+" : ""}{m.cantidad}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, color, value, label, sub }) {
  return (
    <Card className="p-5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}1A` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </Card>
  );
}
function QuickCard({ icon: Icon, title, links }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-4.5 h-4.5 text-slate-600" /></div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {links.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-slate-600 hover:text-[#2E7CF6]">{label}</Link></li>)}
      </ul>
    </Card>
  );
}
