import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Settings2 } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { formatDate, todayISO } from "../../../lib/format";
import { Card, Table, Th, Td, Badge, Button, PageHeader, Modal, Field, Select, Input, Textarea, useToast } from "../../../components/ui";

export default function Movimientos() {
  const data = useDb();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("entrada");
  const [productoId, setProductoId] = useState(data.productos[0]?.id || "");
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");

  const rows = data.movimientosInventario.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  function guardar() {
    const prod = data.productos.find((p) => p.id === Number(productoId));
    if (!prod || !cantidad) return toast.error("Selecciona producto y cantidad.");
    const newId = db.nextId("movInv");
    const delta = tipo === "entrada" ? Number(cantidad) : tipo === "salida" ? -Number(cantidad) : Number(cantidad);
    db.update((s) => {
      s.movimientosInventario.push({ id: newId, tipo, producto_id: prod.id, producto: prod.nombre, cantidad: tipo === "salida" ? Number(cantidad) : Number(cantidad), motivo: motivo || "Movimiento manual", fecha: todayISO(), usuario: "Admin Demo" });
      const p = s.productos.find((x) => x.id === prod.id);
      p.stock_actual = Math.max(0, p.stock_actual + delta);
    });
    toast.success("Movimiento registrado y stock actualizado");
    setOpen(false); setCantidad(1); setMotivo("");
  }

  return (
    <div>
      <PageHeader
        title="Movimientos de Inventario"
        subtitle="Historial de entradas, salidas y ajustes"
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Nuevo movimiento</Button>}
      />
      <Card>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Tipo</Th><Th>Producto</Th><Th>Motivo</Th><Th>Usuario</Th><Th>Fecha</Th><Th className="text-right">Cantidad</Th></tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const entrada = m.tipo === "entrada"; const ajuste = m.tipo === "ajuste";
              return (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <Td>
                    <Badge className={entrada ? "bg-green-100 text-green-700" : ajuste ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-600"}>
                      {ajuste ? <Settings2 className="w-3 h-3" /> : entrada ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {entrada ? "Entrada" : ajuste ? "Ajuste" : "Salida"}
                    </Badge>
                  </Td>
                  <Td className="font-medium text-slate-700">{m.producto}</Td>
                  <Td className="text-slate-500">{m.motivo}</Td>
                  <Td className="text-slate-500">{m.usuario}</Td>
                  <Td className="text-slate-500">{formatDate(m.fecha)}</Td>
                  <Td className="text-right font-semibold text-slate-700">{m.cantidad}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo movimiento" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={guardar}>Registrar</Button></>}>
        <div className="space-y-4">
          <Field label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="entrada">Entrada</option><option value="salida">Salida</option><option value="ajuste">Ajuste</option>
            </Select>
          </Field>
          <Field label="Producto">
            <Select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              {data.productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock {p.stock_actual})</option>)}
            </Select>
          </Field>
          <Field label="Cantidad"><Input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} /></Field>
          <Field label="Motivo"><Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Compra, consumo, ajuste..." /></Field>
        </div>
      </Modal>
    </div>
  );
}
