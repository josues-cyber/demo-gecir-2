import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Phone, Mail, Users } from "lucide-react";
import { useDb, db } from "../../lib/store";
import { formatDate } from "../../lib/format";
import { Button, Card, Table, Th, Td, Input, Badge, EmptyState, PageHeader, Modal, useToast } from "../../components/ui";

export default function Clientes() {
  const data = useDb();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [delId, setDelId] = useState(null);

  const rows = useMemo(() => {
    let r = data.clientes;
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((c) =>
        c.empresa.toLowerCase().includes(s) ||
        (c.id_alt || "").toLowerCase().includes(s) ||
        (c.nif || "").toLowerCase().includes(s) ||
        `#cl-${String(c.numero_referencia).padStart(4, "0")}`.includes(s)
      );
    }
    return r.slice().sort((a, b) => b.id - a.id);
  }, [data.clientes, q]);

  function eliminar() {
    db.update((s) => { s.clientes = s.clientes.filter((c) => c.id !== delId); });
    setDelId(null);
    toast.success("Cliente eliminado");
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gestiona la información de tus clientes"
        actions={<Button onClick={() => navigate("/app/clientes/nuevo")}><Plus className="w-4 h-4" /> Nuevo cliente</Button>}
      />

      <Card>
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por empresa, NIF, ref..." className="pl-9" />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No hay clientes" hint="Crea tu primer cliente" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Ref.</Th><Th>Empresa</Th><Th>ID anterior</Th><Th>NIF</Th><Th>Contacto</Th><Th>Registro</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <Td><span className="font-mono text-slate-500">#CL-{String(c.numero_referencia).padStart(4, "0")}</span></Td>
                  <Td>
                    <p className="font-medium text-slate-800">{c.empresa}</p>
                    {c.direccion && <p className="text-xs text-slate-400">{c.direccion}{c.ciudad ? `, ${c.ciudad}` : ""}</p>}
                  </Td>
                  <Td>{c.id_alt ? <Badge className="bg-slate-100 text-slate-600">{c.id_alt}</Badge> : <span className="text-slate-300">—</span>}</Td>
                  <Td className="text-slate-600">{c.nif || "—"}</Td>
                  <Td>
                    <div className="space-y-0.5">
                      {c.tel && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="w-3 h-3" /> {c.tel}</p>}
                      {c.mail && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Mail className="w-3 h-3" /> {c.mail}</p>}
                    </div>
                  </Td>
                  <Td className="text-slate-500">{formatDate(c.created_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/app/clientes/${c.id}/editar`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => setDelId(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={delId != null}
        onClose={() => setDelId(null)}
        title="Eliminar cliente"
        footer={<><Button variant="outline" onClick={() => setDelId(null)}>Cancelar</Button><Button variant="danger" onClick={eliminar}>Eliminar</Button></>}
      >
        <p className="text-sm text-slate-600">¿Seguro que quieres eliminar este cliente?</p>
      </Modal>
    </div>
  );
}
