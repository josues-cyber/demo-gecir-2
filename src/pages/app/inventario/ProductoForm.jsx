import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { Button, Card, Field, Input, Select, Textarea, PageHeader, useToast } from "../../../components/ui";

export default function ProductoForm() {
  const { id } = useParams();
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const editing = !!id;
  const existing = editing ? data.productos.find((p) => p.id === Number(id)) : null;

  const [form, setForm] = useState(
    existing || {
      codigo: "", nombre: "", descripcion: "", categoria_id: data.categorias[0]?.id || "",
      precio_compra: "", precio_venta: "", stock_actual: 0, stock_minimo: 0, stock_maximo: 0,
      unidad_medida: "ud", ubicacion: "", proveedor_principal: "",
    }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function guardar(e) {
    e.preventDefault();
    if (!form.codigo || !form.nombre) return toast.error("Código y nombre son obligatorios.");
    const payload = {
      ...form, categoria_id: Number(form.categoria_id),
      precio_compra: Number(form.precio_compra || 0), precio_venta: Number(form.precio_venta || 0),
      stock_actual: Number(form.stock_actual || 0), stock_minimo: Number(form.stock_minimo || 0), stock_maximo: Number(form.stock_maximo || 0),
    };
    if (editing) {
      db.update((s) => { Object.assign(s.productos.find((p) => p.id === Number(id)), payload); });
      toast.success("Producto actualizado");
    } else {
      const newId = db.nextId("producto");
      db.update((s) => { s.productos.push({ ...payload, id: newId }); });
      toast.success("Producto creado");
    }
    navigate("/app/inventario/productos");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <PageHeader title={editing ? "Editar Producto" : "Nuevo Producto"} />
      <Card>
        <form onSubmit={guardar} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Código" required><Input value={form.codigo} onChange={set("codigo")} placeholder="PAP-001" /></Field>
            <Field label="Categoría"><Select value={form.categoria_id} onChange={set("categoria_id")}>{data.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</Select></Field>
          </div>
          <Field label="Nombre" required><Input value={form.nombre} onChange={set("nombre")} /></Field>
          <Field label="Descripción"><Textarea rows={2} value={form.descripcion} onChange={set("descripcion")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio compra (€)"><Input type="number" step="0.01" value={form.precio_compra} onChange={set("precio_compra")} /></Field>
            <Field label="Precio venta (€)"><Input type="number" step="0.01" value={form.precio_venta} onChange={set("precio_venta")} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Stock actual"><Input type="number" value={form.stock_actual} onChange={set("stock_actual")} /></Field>
            <Field label="Stock mínimo"><Input type="number" value={form.stock_minimo} onChange={set("stock_minimo")} /></Field>
            <Field label="Stock máximo"><Input type="number" value={form.stock_maximo} onChange={set("stock_maximo")} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Unidad"><Input value={form.unidad_medida} onChange={set("unidad_medida")} /></Field>
            <Field label="Ubicación"><Input value={form.ubicacion} onChange={set("ubicacion")} /></Field>
            <Field label="Proveedor"><Input value={form.proveedor_principal} onChange={set("proveedor_principal")} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">{editing ? "Guardar cambios" : "Crear producto"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
