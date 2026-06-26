import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ChevronRight, Globe, Building2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Field, Input, Label, Button, Select, Checkbox } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";

const PAISES = [
  { code: "ES", name: "España", moneda: "EUR", iva: 21, idLabel: "NIF/CIF" },
  { code: "PT", name: "Portugal", moneda: "EUR", iva: 23, idLabel: "NIF" },
  { code: "EC", name: "Ecuador", moneda: "USD", iva: 15, idLabel: "RUC" },
  { code: "MX", name: "México", moneda: "MXN", iva: 16, idLabel: "RFC" },
];

const ESTADOS_PRECONFIG = ["Sin asignar", "Diseño / Pre", "Producción", "Acabados", "Para entregar", "Entregados"];
const PROCESOS_PRECONFIG = ["Digital", "Offset", "Rotulación", "DTF"];

export default function Entorno() {
  const navigate = useNavigate();
  const { loginUsuario } = useAuth();
  const [step, setStep] = useState(1); // 1 datos, 2 confirmación, 3 creando
  const [pais, setPais] = useState(PAISES[0]);
  const [form, setForm] = useState({ empresa: "", nombre: "", apellidos: "", email: "", idfiscal: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function continuar(e) {
    e.preventDefault();
    setStep(2);
  }
  function enviar() {
    setStep(3);
    setTimeout(() => {
      loginUsuario(form.email || "demo@empresa.com");
      navigate("/app");
    }, 3800);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <span className="text-sm text-slate-400">Solicitud de licencia</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {["Datos de empresa", "Confirmación"].map((label, i) => {
            const n = i + 1;
            const active = step >= n;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold ${active ? "bg-[#2E7CF6] text-white" : "bg-slate-200 text-slate-500"}`}>
                  {step > n ? <Check className="w-4 h-4" /> : n}
                </span>
                <span className={`text-sm ${active ? "text-slate-800 font-medium" : "text-slate-400"}`}>{label}</span>
                {i === 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <form onSubmit={continuar} className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Datos de tu empresa</h2>
            <Field label="Nombre de la empresa" required>
              <Input value={form.empresa} onChange={set("empresa")} placeholder="Mi Imprenta S.L." required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" required><Input value={form.nombre} onChange={set("nombre")} required /></Field>
              <Field label="Apellidos"><Input value={form.apellidos} onChange={set("apellidos")} /></Field>
            </div>
            <Field label="Email de acceso" required>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="tu@empresa.com" required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="País" required>
                <Select value={pais.code} onChange={(e) => setPais(PAISES.find((p) => p.code === e.target.value))}>
                  {PAISES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label={pais.idLabel} required>
                <Input value={form.idfiscal} onChange={set("idfiscal")} required />
              </Field>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Moneda <b>{pais.moneda}</b> · IVA por defecto <b>{pais.iva}%</b> (auto según país)</span>
            </div>
            <Button type="submit" size="lg" className="w-full">Continuar <ChevronRight className="w-4 h-4" /></Button>
          </form>
        )}

        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Confirma tu solicitud</h2>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="w-10 h-10 rounded-lg bg-[#2E7CF6]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#2E7CF6]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{form.empresa || "Mi Imprenta S.L."}</p>
                <p className="text-xs text-slate-500">{form.email} · {pais.name}</p>
              </div>
            </div>

            <div>
              <Label className="mb-2">Tu entorno vendrá preconfigurado con:</Label>
              <ul className="space-y-2 text-sm">
                <PreItem ok label={`${ESTADOS_PRECONFIG.length} estados de trabajo (${ESTADOS_PRECONFIG.join(", ")})`} />
                <PreItem ok label={`${PROCESOS_PRECONFIG.length} procesos (${PROCESOS_PRECONFIG.join(", ")})`} />
                <PreItem ok label="Aviso legal auto-generado" />
                <PreItem label="Configuración SMTP (pendiente en Admin)" />
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Compartir métricas con tu distribuidor (opcional)</p>
              <div className="space-y-2">
                <Checkbox label="Volumen (trabajos por proceso)" defaultChecked />
                <Checkbox label="Inventario (alertas bajo mínimo)" defaultChecked />
                <Checkbox label="Actividad (días de uso, usuarios activos)" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
              <Button onClick={enviar} className="flex-1">Enviar solicitud</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <RefreshCw className="w-8 h-8 text-[#2E7CF6] animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900">Preparando tu entorno</h2>
            <p className="text-sm text-slate-500 mt-1">
              Estamos creando tu base de datos aislada. Esto tarda unos segundos...
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#2E7CF6] animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreItem({ ok, label }) {
  return (
    <li className="flex items-center gap-2 text-slate-600">
      {ok ? (
        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-3 h-3 text-green-600" /></span>
      ) : (
        <span className="w-4 h-4 rounded-full border border-slate-300" />
      )}
      {label}
    </li>
  );
}
