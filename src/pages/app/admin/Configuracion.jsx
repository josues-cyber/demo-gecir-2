import { useState } from "react";
import { HardDrive, Building2, Mail, Sparkles, Server, Check, AlertCircle } from "lucide-react";
import { useDb, db } from "../../../lib/store";
import { Card, CardHeader, CardBody, Button, Field, Input, Textarea, Select, Checkbox, Badge, PageHeader, useToast } from "../../../components/ui";

export default function AdminConfiguracion() {
  const data = useDb();
  const toast = useToast();
  const cs = data.companySettings;

  const [empresa, setEmpresa] = useState(cs);
  const setE = (k) => (e) => setEmpresa((f) => ({ ...f, [k]: e.target.value }));
  function guardarEmpresa() {
    db.update((s) => { Object.assign(s.companySettings, empresa); });
    toast.success("Datos de empresa guardados");
  }

  const [smtp, setSmtp] = useState({ host: "", port: "587", user: "", pass: "", from: "", fromName: cs.nombre_empresa, ssl: false });
  const setS = (k) => (e) => setSmtp((f) => ({ ...f, [k]: e.target.value }));
  function guardarSmtp() {
    db.update((s) => { s.companySettings.smtp_default = false; });
    toast.success("Configuración SMTP guardada (encriptada)");
  }

  const [groq, setGroq] = useState({ modelo: "llama-3.1-8b-instant", apiKey: "" });
  function guardarGroq() {
    if (!groq.apiKey) return toast.error("Introduce la API Key de Groq.");
    db.update((s) => { s.companySettings.groq_configurada = true; });
    toast.success("API Key de Groq guardada (OCR IA activado)");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" subtitle="Ajustes de tu empresa, correo, IA y almacenamiento" />

      {/* Almacenamiento */}
      <Card>
        <CardHeader className="flex items-center gap-2.5">
          <HardDrive className="w-4.5 h-4.5 text-[#2E7CF6]" />
          <h3 className="font-semibold text-slate-800">Almacenamiento</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Archivos totales" value="128" />
            <Stat label="Espacio usado" value="42 MB" />
            <Stat label="Disponible" value="500 MB" />
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#2E7CF6]" style={{ width: "8.4%" }} />
          </div>
        </CardBody>
      </Card>

      {/* Datos empresa */}
      <Card>
        <CardHeader className="flex items-center gap-2.5">
          <Building2 className="w-4.5 h-4.5 text-[#2E7CF6]" />
          <h3 className="font-semibold text-slate-800">Datos de la empresa</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre de empresa"><Input value={empresa.nombre_empresa} onChange={setE("nombre_empresa")} /></Field>
            <Field label="Email de contacto"><Input value={empresa.email} onChange={setE("email")} /></Field>
            <Field label="Teléfono"><Input value={empresa.telefono} onChange={setE("telefono")} /></Field>
            <Field label="Web"><Input value={empresa.web} onChange={setE("web")} /></Field>
          </div>
          <Field label="Dirección"><Textarea rows={2} value={empresa.direccion} onChange={setE("direccion")} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="País"><Input value={empresa.pais} onChange={setE("pais")} /></Field>
            <Field label="Moneda"><Input value={empresa.moneda} onChange={setE("moneda")} /></Field>
            <Field label="IVA por defecto (%)"><Input type="number" value={empresa.iva_default} onChange={setE("iva_default")} /></Field>
          </div>
          <Field label="Aviso legal"><Textarea rows={2} value={empresa.aviso_legal} onChange={setE("aviso_legal")} /></Field>
          <div className="flex justify-end"><Button onClick={guardarEmpresa}>Guardar cambios</Button></div>
        </CardBody>
      </Card>

      {/* SMTP */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4.5 h-4.5 text-[#2E7CF6]" />
            <h3 className="font-semibold text-slate-800">Configuración de Email (SMTP por licencia)</h3>
          </div>
          {cs.smtp_default
            ? <Badge className="bg-amber-50 text-amber-700"><AlertCircle className="w-3 h-3" /> Usando SMTP por defecto</Badge>
            : <Badge className="bg-green-50 text-green-700"><Check className="w-3 h-3" /> Configuración personalizada</Badge>}
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-slate-500 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            Las credenciales SMTP se guardan encriptadas en la base de datos de tu licencia, nunca en archivos .env.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Servidor SMTP"><Input value={smtp.host} onChange={setS("host")} placeholder="smtp.gmail.com" /></Field>
            <Field label="Puerto"><Input value={smtp.port} onChange={setS("port")} placeholder="587" /></Field>
            <Field label="Usuario / Email"><Input value={smtp.user} onChange={setS("user")} /></Field>
            <Field label="Contraseña / App Password"><Input type="password" value={smtp.pass} onChange={setS("pass")} /></Field>
            <Field label="Email remitente"><Input value={smtp.from} onChange={setS("from")} /></Field>
            <Field label="Nombre remitente"><Input value={smtp.fromName} onChange={setS("fromName")} /></Field>
          </div>
          <Checkbox label="Usar SSL/TLS seguro (puerto 465)" checked={smtp.ssl} onChange={(e) => setSmtp((f) => ({ ...f, ssl: e.target.checked }))} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => toast.info("Email de prueba enviado (simulado)")}>Enviar test</Button>
            <Button onClick={guardarSmtp}>Guardar SMTP</Button>
          </div>
        </CardBody>
      </Card>

      {/* IA Groq */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-[#2E7CF6]" />
            <h3 className="font-semibold text-slate-800">OCR con IA (Groq) por licencia</h3>
          </div>
          {cs.groq_configurada
            ? <Badge className="bg-green-50 text-green-700"><Check className="w-3 h-3" /> Configuración activa</Badge>
            : <Badge className="bg-slate-100 text-slate-500">Sin API Key personalizada</Badge>}
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor"><Input value="groq" disabled className="bg-slate-50" /></Field>
            <Field label="Modelo"><Input value={groq.modelo} onChange={(e) => setGroq((g) => ({ ...g, modelo: e.target.value }))} /></Field>
          </div>
          <Field label="API Key de Groq"><Input type="password" value={groq.apiKey} onChange={(e) => setGroq((g) => ({ ...g, apiKey: e.target.value }))} placeholder="gsk_..." /></Field>
          <div className="flex justify-end"><Button onClick={guardarGroq}>Guardar</Button></div>
        </CardBody>
      </Card>

      {/* Variables de entorno */}
      <Card>
        <CardHeader className="flex items-center gap-2.5">
          <Server className="w-4.5 h-4.5 text-[#2E7CF6]" />
          <h3 className="font-semibold text-slate-800">Variables de entorno</h3>
        </CardHeader>
        <CardBody className="space-y-2">
          {[
            { name: "NEXT_PUBLIC_API_URL", desc: "URL del backend", status: "Configurada", ok: true },
            { name: "JWT_SECRET", desc: "Firma de tokens", status: "Configurada", ok: true },
            { name: "ENCRYPTION_SECRET", desc: "AES para credenciales", status: "Configurada", ok: true },
            { name: "GROQ_API_KEY", desc: "OCR IA global (fallback)", status: "Opcional", ok: false },
          ].map((v) => (
            <div key={v.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-mono text-sm text-slate-700">{v.name}</p>
                <p className="text-xs text-slate-400">{v.desc}</p>
              </div>
              <Badge className={v.ok ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}>{v.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
