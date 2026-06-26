import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, ReceiptText } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { docTotales } from "../../lib/calc";
import { formatCurrency, formatDate, todayISO } from "../../lib/format";
import { Button, Card, Table, Th, Td, Badge, EmptyState, PageHeader, useToast } from "../../components/ui";

export default function Albaranes() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [sel, setSel] = useState([]);
  const clienteById = useMemo(() => Object.fromEntries(data.clientes.map((c) => [c.id, c])), [data.clientes]);
  const rows = data.albaranes.slice().sort((a, b) => b.id - a.id);

  function toggle(id) {
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function generarFactura() {
    if (sel.length === 0) return;
    const albs = data.albaranes.filter((a) => sel.includes(a.id) && a.estado === "pendiente");
    if (albs.length === 0) return toast.error("Selecciona albaranes pendientes.");
    const cliente_id = albs[0].cliente_id;
    if (albs.some((a) => a.cliente_id !== cliente_id)) return toast.error("Todos los albaranes deben ser del mismo cliente.");

    const newId = db.nextId("factura");
    const lineas = albs.flatMap((a) => a.lineas);
    db.update((s) => {
      s.facturas.push({
        id: newId, numero_factura: `F-2026-${String(newId).padStart(4, "0")}`,
        cliente_id, numero_presupuesto: albs[0].numero_presupuesto || "",
        concepto: albs.map((a) => a.trabajo_descripcion).join(", "),
        fecha_factura: todayISO(), fecha_enviado: null, fechafact_pagada: null,
        iva: albs[0].iva, lineas,
      });
      albs.forEach((a) => { s.albaranes.find((x) => x.id === a.id).estado = "facturado"; });
    });
    setSel([]);
    toast.success(`Factura F-2026-${String(newId).padStart(4, "0")} generada`);
    navigate("/app/facturas");
  }

  function eliminar(id) {
    db.update((s) => { s.albaranes = s.albaranes.filter((a) => a.id !== id); });
    toast.success("Albarán eliminado");
  }

  const selCount = sel.filter((id) => data.albaranes.find((a) => a.id === id)?.estado === "pendiente").length;

  return (
    <div>
      <PageHeader
        title="Albaranes"
        subtitle="Gestión de albaranes de entrega"
        actions={<Button onClick={generarFactura} disabled={selCount === 0}><ReceiptText className="w-4 h-4" /> Generar factura ({selCount})</Button>}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={FileText} title="No hay albaranes" hint="Convierte un presupuesto aprobado en albarán" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th className="w-10"></Th><Th>Número</Th><Th>Fecha</Th><Th>Cliente</Th><Th>Presupuesto</Th>
                <Th>Descripción</Th><Th>Estado</Th><Th>Total</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const cli = clienteById[a.cliente_id];
                const { total } = docTotales(a);
                const facturado = a.estado === "facturado";
                return (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td>{!facturado && <input type="checkbox" checked={sel.includes(a.id)} onChange={() => toggle(a.id)} className="h-4 w-4 rounded border-slate-300 text-[#2E7CF6]" />}</Td>
                    <Td><span className="font-mono font-semibold text-slate-800">{a.numero_albaran}</span></Td>
                    <Td className="text-slate-500">{formatDate(a.fecha_albaran)}</Td>
                    <Td className="font-medium text-slate-700">{cli?.empresa || "—"}</Td>
                    <Td className="text-slate-500 font-mono">{a.numero_presupuesto || "—"}</Td>
                    <Td className="max-w-[200px]"><span className="line-clamp-1">{a.trabajo_descripcion}</span></Td>
                    <Td>
                      <Badge className={facturado ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-700"}>
                        {facturado ? "Facturado" : "Pendiente"}
                      </Badge>
                    </Td>
                    <Td className="font-semibold text-slate-800">{formatCurrency(total)}</Td>
                    <Td>{!facturado && <button onClick={() => eliminar(a.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <p className="text-xs text-slate-400 mt-3">
        Selecciona uno o varios albaranes pendientes del mismo cliente y pulsa <b>Generar factura</b> para crear una factura combinada.
      </p>
    </div>
  );
}
