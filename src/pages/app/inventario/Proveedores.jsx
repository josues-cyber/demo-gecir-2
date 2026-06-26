import { Mail, Phone, User } from "lucide-react";
import { useDb } from "../../../lib/store";
import { Card, Table, Th, Td, PageHeader } from "../../../components/ui";

export default function Proveedores() {
  const data = useDb();
  return (
    <div>
      <PageHeader title="Proveedores" subtitle="Directorio de proveedores de material" />
      <Card>
        <Table>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50"><Th>Proveedor</Th><Th>NIF</Th><Th>Contacto</Th><Th>Teléfono</Th><Th>Email</Th></tr>
          </thead>
          <tbody>
            {data.proveedores.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <Td className="font-medium text-slate-800">{p.nombre}</Td>
                <Td className="text-slate-600">{p.nif}</Td>
                <Td className="text-slate-500"><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {p.contacto}</span></Td>
                <Td className="text-slate-500"><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {p.tel}</span></Td>
                <Td className="text-slate-500"><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {p.mail}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
