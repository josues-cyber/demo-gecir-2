import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown, DollarSign, Search, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { cajaResumen } from "../../lib/calc";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { Button, Card, Table, Th, Td, Badge, Input, Select, EmptyState, PageHeader, useToast } from "../../components/ui";

export default function Caja() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const resumen = cajaResumen(data.movimientosCaja);
  const clienteById = useMemo(() => Object.fromEntries(data.clientes.map((c) => [c.id, c])), [data.clientes]);

  const rows = useMemo(() => {
    let r = data.movimientosCaja.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    if (tipo !== "todos") r = r.filter((m) => m.tipo === tipo);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((m) => m.concepto.toLowerCase().includes(s) || (clienteById[m.cliente_id]?.empresa || "").toLowerCase().includes(s));
    }
    return r;
  }, [data.movimientosCaja, q, tipo, clienteById]);

  function eliminar(id) {
    db.update((s) => { s.movimientosCaja = s.movimientosCaja.filter((m) => m.id !== id); });
    toast.success("Movimiento eliminado");
  }

  return (
    <div>
      <PageHeader
        title="Control de Caja"
        subtitle="Gestión financiera y movimientos"
        actions={<Button onClick={() => navigate("/app/caja/nuevo-movimiento")}><Plus className="w-4 h-4" /> Nuevo movimiento</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <ResumenCard icon={TrendingUp} color="#10b981" label="Ingresos totales" value={resumen.ingresos} sub="Total de ingresos registrados" />
        <ResumenCard icon={TrendingDown} color="#ef4444" label="Gastos totales" value={resumen.gastos} sub="Total de gastos registrados" />
        <ResumenCard icon={DollarSign} color={resumen.saldo >= 0 ? "#10b981" : "#ef4444"} label="Balance" value={resumen.saldo} sub={resumen.saldo >= 0 ? "Balance positivo" : "Balance negativo"} />
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar concepto, cliente..." className="pl-9" />
          </div>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-10 w-40">
            <option value="todos">Todos</option><option value="ingreso">Ingresos</option><option value="gasto">Gastos</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={DollarSign} title="Sin movimientos" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Fecha</Th><Th>Tipo</Th><Th>Concepto</Th><Th>Cliente</Th><Th>Método</Th><Th className="text-right">Importe</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const ingreso = m.tipo === "ingreso";
                return (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td className="text-slate-500 whitespace-nowrap">{formatDateTime(m.fecha)}</Td>
                    <Td>
                      <Badge className={ingreso ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}>
                        {ingreso ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {ingreso ? "Ingreso" : "Gasto"}
                      </Badge>
                    </Td>
                    <Td>
                      <p className="text-slate-700">{m.concepto}</p>
                      {m.observaciones && <p className="text-xs text-slate-400">{m.observaciones}</p>}
                    </Td>
                    <Td className="text-slate-500">{clienteById[m.cliente_id]?.empresa || "—"}</Td>
                    <Td className="text-slate-500">{m.metodo_pago || "—"}</Td>
                    <Td className={`text-right font-semibold ${ingreso ? "text-green-600" : "text-red-600"}`}>{ingreso ? "+" : "-"}{formatCurrency(m.importe)}</Td>
                    <Td><button onClick={() => eliminar(m.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ResumenCard({ icon: Icon, color, label, value, sub }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1A` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(value)}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">{sub}</p>
    </Card>
  );
}
