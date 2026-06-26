import { useState, useMemo } from "react";
import { Search, Eye, Briefcase, DollarSign, Package, Mail, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { useDb } from "../../lib/store";
import { pedidosDeCliente, pct } from "../../lib/calc";
import { formatCurrency, formatDate } from "../../lib/format";
import { Card, Table, Th, Td, Badge, Input, PageHeader, useToast } from "../../components/ui";

export default function DistribuidorClientes() {
  const data = useDb();
  const [q, setQ] = useState("");
  const [detalle, setDetalle] = useState(null);
  const rows = data.distribuidorClientes.filter((c) => c.empresa.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Mis clientes" subtitle="Detalle de pedidos, referencias y facturación por cliente" />
      <Card>
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
          </div>
        </div>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <Th>Empresa</Th><Th>País</Th><Th className="text-right">Facturación mes</Th>
              <Th className="text-right">Trabajos/mes</Th><Th className="text-right">Alertas</Th><Th>Estado</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer" onClick={() => setDetalle(c)}>
                <Td className="font-medium text-slate-800">{c.empresa}</Td>
                <Td className="text-slate-500">{c.pais}</Td>
                <Td className="text-right font-semibold text-slate-800">{formatCurrency(c.facturacion_mes)}</Td>
                <Td className="text-right text-slate-700">{c.trabajos_mes}</Td>
                <Td className="text-right">{c.alertas_stock > 0 ? <Badge className="bg-amber-100 text-amber-700">{c.alertas_stock}</Badge> : <span className="text-slate-300">0</span>}</Td>
                <Td><Badge color={c.estado === "activo" ? "#22c55e" : "#ef4444"} className={c.estado === "activo" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}>{c.estado === "activo" ? "Activo" : "Inactivo"}</Badge></Td>
                <Td><button className="p-1.5 rounded-lg text-[#2E7CF6] hover:bg-blue-50"><Eye className="w-4 h-4" /></button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {detalle && <ClienteDetalle cliente={detalle} data={data} onClose={() => setDetalle(null)} />}
    </div>
  );
}

function ClienteDetalle({ cliente, data, onClose }) {
  const toast = useToast();
  const pedidos = useMemo(() => pedidosDeCliente(data, cliente.id), [data, cliente.id]);
  const totalPedido = pedidos.reduce((s, p) => s + p.importe, 0);
  const factPct = pct(cliente.facturacion_mes, cliente.facturacion_mes_anterior);
  const trabPct = pct(cliente.trabajos_mes, cliente.trabajos_mes_anterior);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-ink-gradient text-white p-6 rounded-t-2xl flex items-start justify-between sticky top-0">
          <div>
            <Badge className="bg-white/10 text-blue-200 mb-2">{cliente.pais}</Badge>
            <h2 className="text-xl font-bold">{cliente.empresa}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{cliente.dias_activos} días activo · {cliente.estado === "activo" ? "Cliente activo" : "Inactivo"}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {/* Métricas del cliente */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricBox icon={DollarSign} color="#10b981" value={formatCurrency(cliente.facturacion_mes)} label="Facturación mes" delta={factPct} />
            <MetricBox icon={Briefcase} color="#2E7CF6" value={cliente.trabajos_mes} label="Trabajos mes" delta={trabPct} />
            <MetricBox icon={Package} color="#8b5cf6" value={pedidos.length} label="Pedidos recientes" />
            <MetricBox icon={DollarSign} color="#f59e0b" value={formatCurrency(totalPedido)} label="Total pedidos" />
          </div>

          {/* Historial de pedidos con referencias */}
          <h3 className="font-semibold text-slate-800 mb-2">Historial de pedidos</h3>
          {pedidos.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Este cliente aún no tiene pedidos registrados.</p>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden mb-6">
              <Table>
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <Th>Referencia</Th><Th>Código</Th><Th className="text-right">Cantidad</Th><Th className="text-right">Precio ud.</Th><Th className="text-right">Importe</Th><Th>Fecha</Th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <Td className="font-medium text-slate-700">{p.referencia.nombre}</Td>
                      <Td><Badge className="bg-slate-100 text-slate-600 font-mono">{p.referencia.codigo}</Badge></Td>
                      <Td className="text-right">{p.cantidad}</Td>
                      <Td className="text-right text-slate-500">{formatCurrency(p.referencia.precio_venta)}</Td>
                      <Td className="text-right font-semibold text-slate-800">{formatCurrency(p.importe)}</Td>
                      <Td className="text-slate-500">{formatDate(p.fecha)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Acción manual: contactar por inventario/stock */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#2E7CF6]" />
              <div>
                <p className="text-sm font-medium text-slate-800">Contacto manual por inventario</p>
                <p className="text-xs text-slate-500">Avisa al cliente de referencias que le pueden faltar según su stock.</p>
              </div>
            </div>
            <button
              onClick={() => { toast.success(`Email de reposición enviado a ${cliente.empresa}`); onClose(); }}
              className="inline-flex items-center gap-1.5 bg-[#2E7CF6] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#1d63d8]"
            >
              <Mail className="w-4 h-4" /> Enviar email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, color, value, label, delta }) {
  const up = delta >= 0;
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4" style={{ color }} />
        {delta != null && (
          <span className={`inline-flex items-center text-xs font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{up ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
