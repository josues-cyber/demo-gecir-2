import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { formatCurrency } from "../../../lib/format";
import { Button, Card, Table, Th, Td, Badge, Input, EmptyState, PageHeader, useToast } from "../../../components/ui";

export default function Productos() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const catById = useMemo(() => Object.fromEntries(data.categorias.map((c) => [c.id, c])), [data.categorias]);

  const rows = useMemo(() => {
    let r = data.productos;
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((p) => p.nombre.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s) || (catById[p.categoria_id]?.nombre || "").toLowerCase().includes(s));
    }
    return r;
  }, [data.productos, q, catById]);

  function eliminar(id) {
    db.update((s) => { s.productos = s.productos.filter((p) => p.id !== id); });
    toast.success("Producto eliminado");
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Control de stock e inventario"
        actions={<Button onClick={() => navigate("/app/inventario/productos/nuevo")}><Plus className="w-4 h-4" /> Nuevo producto</Button>}
      />
      <Card>
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto, código, categoría..." className="pl-9" />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Package} title="No hay productos" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Producto</Th><Th>Código</Th><Th>Categoría</Th><Th>Stock</Th><Th>Precios</Th><Th>Ubicación</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cat = catById[p.categoria_id];
                const bajo = p.stock_actual <= p.stock_minimo;
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-2">
                        {bajo ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        <div>
                          <p className="font-medium text-slate-800">{p.nombre}</p>
                          <p className="text-xs text-slate-400">{p.descripcion}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><Badge className="bg-slate-100 text-slate-600 font-mono">{p.codigo}</Badge></Td>
                    <Td>{cat && <Badge color={cat.color} className="bg-slate-100 text-slate-700">{cat.nombre}</Badge>}</Td>
                    <Td><span className={bajo ? "text-red-600 font-semibold" : "text-slate-700"}>{p.stock_actual}</span><span className="text-slate-400"> / {p.stock_minimo} mín</span></Td>
                    <Td className="text-slate-500 text-xs">C: {formatCurrency(p.precio_compra)}<br />V: {formatCurrency(p.precio_venta)}</Td>
                    <Td className="text-slate-500">{p.ubicacion}</Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/app/inventario/productos/${p.id}/editar`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => eliminar(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
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
