import { useMemo } from "react";
import { ChevronRight, Layers } from "lucide-react";
import { useDb } from "../../../lib/store";
import { Card, Badge, PageHeader } from "../../../components/ui";

export default function Categorias() {
  const data = useDb();
  const productosPorCat = useMemo(() => {
    const map = {};
    data.productos.forEach((p) => { map[p.categoria_id] = (map[p.categoria_id] || 0) + 1; });
    return map;
  }, [data.productos]);

  return (
    <div>
      <PageHeader title="Categorías" subtitle="Organiza tu inventario por categorías y subcategorías" />
      <div className="space-y-3">
        {data.categorias.map((cat) => (
          <Card key={cat.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}1A` }}>
                  <Layers className="w-4.5 h-4.5" style={{ color: cat.color }} />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{cat.nombre}</p>
                  <p className="text-xs text-slate-400">{cat.descripcion}</p>
                </div>
              </div>
              <Badge color={cat.color} className="bg-slate-100 text-slate-600">{productosPorCat[cat.id] || 0} productos</Badge>
            </div>
            {cat.subcategorias?.length > 0 && (
              <div className="mt-3 pl-12 space-y-1.5">
                {cat.subcategorias.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="w-2 h-2 rounded-full" style={{ background: sub.color }} />
                    {sub.nombre}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
