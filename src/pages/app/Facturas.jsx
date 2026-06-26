import { useState, useMemo } from "react";
import { Send, CheckCircle2, ReceiptText } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { docTotales } from "../../lib/calc";
import { formatCurrency, formatDate, todayISO } from "../../lib/format";
import { Card, Table, Th, Td, Badge, EmptyState, PageHeader, Select, useToast } from "../../components/ui";

export default function Facturas() {
  const data = useDb();
  const toast = useToast();
  const [fEnvio, setFEnvio] = useState("todas");
  const [fPago, setFPago] = useState("todas");
  const clienteById = useMemo(() => Object.fromEntries(data.clientes.map((c) => [c.id, c])), [data.clientes]);

  const rows = useMemo(() => {
    let r = data.facturas.slice().sort((a, b) => b.id - a.id);
    if (fEnvio === "enviada") r = r.filter((f) => f.fecha_enviado);
    if (fEnvio === "sin") r = r.filter((f) => !f.fecha_enviado);
    if (fPago === "pagada") r = r.filter((f) => f.fechafact_pagada);
    if (fPago === "sin") r = r.filter((f) => !f.fechafact_pagada);
    return r;
  }, [data.facturas, fEnvio, fPago]);

  function toggleEnviada(f) {
    db.update((s) => { const x = s.facturas.find((y) => y.id === f.id); x.fecha_enviado = x.fecha_enviado ? null : todayISO(); });
    toast.success(f.fecha_enviado ? "Marcada como no enviada" : "Factura enviada al cliente");
  }
  function togglePagada(f) {
    db.update((s) => { const x = s.facturas.find((y) => y.id === f.id); x.fechafact_pagada = x.fechafact_pagada ? null : todayISO(); });
    toast.success(f.fechafact_pagada ? "Marcada como pendiente" : "Factura marcada como pagada");
  }

  return (
    <div>
      <PageHeader title="Facturas" subtitle="Gestiona las facturas generadas" />
      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Envío:</span>
            <Select value={fEnvio} onChange={(e) => setFEnvio(e.target.value)} className="h-9 w-36">
              <option value="todas">Todas</option><option value="enviada">Enviada</option><option value="sin">Sin enviar</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Pago:</span>
            <Select value={fPago} onChange={(e) => setFPago(e.target.value)} className="h-9 w-36">
              <option value="todas">Todas</option><option value="pagada">Pagada</option><option value="sin">Sin pagar</option>
            </Select>
          </div>
          <span className="text-xs text-slate-400 ml-auto">{rows.length} de {data.facturas.length} facturas</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={ReceiptText} title="No hay facturas" hint="Genera una factura desde Albaranes" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Número</Th><Th>Cliente</Th><Th>Concepto</Th><Th>Fecha</Th><Th>F. Enviada</Th><Th>F. Pagada</Th><Th>Total</Th><Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const cli = clienteById[f.cliente_id];
                const { total } = docTotales(f);
                return (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td><span className="font-mono font-semibold text-slate-800">{f.numero_factura}</span></Td>
                    <Td className="font-medium text-slate-700">{cli?.empresa || "—"}</Td>
                    <Td className="max-w-[200px]"><span className="line-clamp-1">{f.concepto}</span></Td>
                    <Td className="text-slate-500">{formatDate(f.fecha_factura)}</Td>
                    <Td>{f.fecha_enviado ? <Badge className="bg-blue-100 text-blue-700">{formatDate(f.fecha_enviado)}</Badge> : <span className="text-slate-300">—</span>}</Td>
                    <Td>{f.fechafact_pagada ? <Badge className="bg-green-100 text-green-700">{formatDate(f.fechafact_pagada)}</Badge> : <span className="text-slate-300">—</span>}</Td>
                    <Td className="font-semibold text-slate-800">{formatCurrency(total)}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button title="Enviar" onClick={() => toggleEnviada(f)} className={`p-1.5 rounded-lg hover:bg-slate-100 ${f.fecha_enviado ? "text-blue-600" : "text-slate-400"}`}><Send className="w-4 h-4" /></button>
                        <button title="Pagada" onClick={() => togglePagada(f)} className={`p-1.5 rounded-lg hover:bg-slate-100 ${f.fechafact_pagada ? "text-green-600" : "text-slate-400"}`}><CheckCircle2 className="w-4 h-4" /></button>
                      </div>
                    </Td>
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
