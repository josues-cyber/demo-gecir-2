import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Check, ChevronRight, ChevronLeft, Building2, KeyRound, RefreshCw, CheckCircle2,
  AlertCircle, Printer, Users, BarChart3, FileText, Info,
} from "lucide-react";
import { Field, Input, Label, Button, Select } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { useDb, db } from "../../lib/store";
import { daysFromNow } from "../../lib/format";
import { ESTADOS_TRABAJO, PROCESOS } from "../../lib/seed";

const PAISES = [
  { code: "ES", name: "España", moneda: "EUR", iva: 21, idLabel: "NIF / CIF", ej: "B12345678" },
  { code: "PT", name: "Portugal", moneda: "EUR", iva: 23, idLabel: "NIF", ej: "123456789" },
  { code: "EC", name: "Ecuador", moneda: "USD", iva: 15, idLabel: "RUC", ej: "1790012345001" },
  { code: "MX", name: "México", moneda: "MXN", iva: 16, idLabel: "RFC", ej: "XAXX010101000" },
  { code: "CO", name: "Colombia", moneda: "COP", iva: 19, idLabel: "NIT", ej: "900123456-7" },
  { code: "BR", name: "Brasil", moneda: "BRL", iva: 17, idLabel: "CNPJ", ej: "12.345.678/0001-95" },
];

const FEATURES = [
  { icon: Printer, text: "Gestión completa de trabajos y estados" },
  { icon: Users, text: "Clientes, presupuestos y facturas" },
  { icon: BarChart3, text: "Estadísticas y control de caja" },
  { icon: FileText, text: "Albaranes y notas de entrega" },
];

const PROV_STEPS = ["Activando tu licencia...", "Creando tu base de datos...", "Cargando datos iniciales..."];

export default function Onboarding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginUsuario } = useAuth();
  const data = useDb();

  const licenseKey = params.get("key") || "";
  const emailParam = params.get("email") || "";
  const licencia = useMemo(() => data.licencias.find((l) => l.license_key === licenseKey), [data.licencias, licenseKey]);
  const distribuidor = licencia?.proveedor || "tu distribuidor";

  const [step, setStep] = useState(1);
  const [pais, setPais] = useState(PAISES[0]);
  const [form, setForm] = useState({ company_name: "", nombre: "", apellidos: "", tax_id: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Provisioning
  const [stage, setStage] = useState(null); // null | "provisioning" | "done"
  const [provStep, setProvStep] = useState(0);

  function continuar() {
    setError("");
    if (!form.company_name.trim()) return setError("El nombre de empresa es obligatorio.");
    if (!form.nombre.trim() || !form.apellidos.trim()) return setError("Tu nombre y apellidos son obligatorios.");
    if (!form.tax_id.trim()) return setError(`El ${pais.idLabel} es obligatorio.`);
    setStep(2);
  }
  function enviar() {
    setStage("provisioning");
  }

  useEffect(() => {
    if (stage !== "provisioning") return;
    if (provStep < PROV_STEPS.length - 1) {
      const t = setTimeout(() => setProvStep((s) => s + 1), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      db.update((s) => {
        const lic = s.licencias.find((l) => l.license_key === licenseKey);
        if (lic) {
          lic.estado = "activa"; lic.empresa = form.company_name; lic.email = emailParam || lic.email;
          lic.db_status = "READY"; lic.vencimiento = daysFromNow(365); lic.pausada = false;
        }
      });
      setStage("done");
    }, 1100);
    return () => clearTimeout(t);
  }, [stage, provStep]); // eslint-disable-line

  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(() => {
      loginUsuario(emailParam || "demo@empresa.com", form.company_name);
      navigate("/app");
    }, 1700);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line

  if (!licenseKey) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Enlace de activación no válido</p>
          <Link to="/auth/login" className="inline-block mt-4 text-[#2E7CF6] underline text-sm">Ir al inicio de sesión</Link>
        </div>
      </div>
    );
  }

  // Overlay de aprovisionamiento (sobre todo)
  if (stage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-gradient px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          {stage === "provisioning" ? (
            <>
              <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-[#2E7CF6]" />
              <h2 className="text-xl font-bold text-slate-900 mb-1">Preparando tu entorno</h2>
              <p className="text-slate-500 text-sm">{PROV_STEPS[provStep]}</p>
              <div className="flex items-center justify-center gap-1.5 mt-5">
                {PROV_STEPS.map((_, i) => <span key={i} className={`w-2 h-2 rounded-full ${i <= provStep ? "bg-[#2E7CF6]" : "bg-slate-200"}`} />)}
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">¡Tu entorno está listo!</h2>
              <p className="text-slate-500 text-sm">Tu cuenta de GECIR ha sido configurada. Entrando...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between p-10 xl:p-14 bg-ink-gradient">
        <Link to="/"><Logo variant="white" /></Link>
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">Tu imprenta,<br />organizada.</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Gestiona trabajos, clientes y facturación desde un único lugar, diseñado para artes gráficas.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(46,124,246,0.15)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#60a5fa" }} />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[{ n: 1, label: "Datos de tu empresa" }, { n: 2, label: "Confirmar y enviar" }].map(({ n, label }) => (
            <div key={n} className={`flex items-center gap-3 transition-all ${step === n ? "opacity-100" : "opacity-40"}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
                style={{ background: step >= n ? "#2E7CF6" : "transparent", border: step <= n ? "1.5px solid #2E7CF6" : "none" }}>
                {step > n ? <Check className="w-3 h-3" /> : n}
              </div>
              <span className="text-sm font-medium" style={{ color: step === n ? "#fff" : "#94a3b8" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <Logo />
          <span className="text-xs text-slate-400">Paso {step} de 2</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 max-w-xl w-full mx-auto">
          {step === 1 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Cuéntanos sobre tu empresa</h2>
                <p className="text-slate-500 text-sm mt-1">Solo lo esencial. Todo lo demás lo ajustas después.</p>
              </div>

              {/* Banner licencia */}
              <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-3 mb-5">
                <div className="flex items-center gap-2 min-w-0">
                  <KeyRound className="w-4 h-4 text-[#2E7CF6] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Licencia asignada por {distribuidor}</p>
                    <p className="font-mono text-sm text-slate-800 truncate">{licenseKey}</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Nombre de la empresa <span className="text-red-400">*</span></Label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={form.company_name} onChange={set("company_name")} placeholder="Ej: Imprenta García S.L." className="pl-9" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tu nombre" required><Input value={form.nombre} onChange={set("nombre")} placeholder="Nombre" /></Field>
                  <Field label="Apellidos" required><Input value={form.apellidos} onChange={set("apellidos")} placeholder="Apellidos" /></Field>
                </div>

                <Field label="Email de acceso" hint="Pre-asignado por tu distribuidor">
                  <Input value={emailParam} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="País" required>
                    <Select value={pais.code} onChange={(e) => setPais(PAISES.find((p) => p.code === e.target.value))}>
                      {PAISES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </Select>
                  </Field>
                  <Field label={pais.idLabel} required>
                    <Input value={form.tax_id} onChange={set("tax_id")} placeholder={pais.ej} />
                  </Field>
                </div>

                {/* Badge auto-derivado */}
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "#f0f7ff", color: "#1e40af" }}>
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Moneda configurada: <strong>{pais.moneda}</strong> · IVA <strong>{pais.iva}%</strong></span>
                </div>

                <Button onClick={continuar} className="w-full" size="lg">Continuar <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: "#f0f7ff" }}>
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Todo listo</h2>
                <p className="text-slate-500 text-sm mt-1">Revisa la configuración antes de crear tu entorno.</p>
              </div>

              {/* Resumen empresa */}
              <div className="rounded-xl border border-slate-100 overflow-hidden mb-5">
                <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "#f0f7ff" }}>
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">{form.company_name}</p>
                    <p className="text-sm text-slate-500">{pais.idLabel}: {form.tax_id}</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    ["Responsable", `${form.nombre} ${form.apellidos}`],
                    ["Email", emailParam],
                    ["País", pais.name],
                    ["Moneda", `${pais.moneda} · IVA ${pais.iva}%`],
                    ["Licencia", licenseKey],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-800 font-medium text-right max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración automática (pipeline + procesos) */}
              <div className="rounded-xl border border-slate-100 p-4 mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Configuración automática · incluido y listo</p>

                {/* Pipeline de estados */}
                <p className="text-sm font-medium text-slate-700 mb-2">Pipeline de trabajos ({ESTADOS_TRABAJO.length} estados)</p>
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {ESTADOS_TRABAJO.map((e, i) => (
                    <span key={e.key} className="inline-flex items-center">
                      <span className="rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ background: e.color }}>{e.label}</span>
                      {i < ESTADOS_TRABAJO.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-0.5" />}
                    </span>
                  ))}
                </div>

                {/* Procesos */}
                <p className="text-sm font-medium text-slate-700 mb-2">Tipos de proceso ({PROCESOS.length})</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {PROCESOS.map((p) => (
                    <span key={p.key} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} /> {p.label}
                    </span>
                  ))}
                </div>

                {/* Otros */}
                <div className="space-y-2">
                  {[
                    ["✓", "Aviso legal", "Generado automáticamente"],
                    ["✓", "Moneda e IVA", `Según el país (${pais.moneda} · ${pais.iva}%)`],
                    ["✓", "3 roles base", "Administrador, Usuario, Empleado"],
                    ["○", "Configuración de correo SMTP", "Admin → Configuración (después)"],
                  ].map(([icon, title, sub]) => (
                    <div key={title} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 font-bold shrink-0 ${icon === "✓" ? "text-green-500" : "text-slate-300"}`}>{icon}</span>
                      <div><span className="text-slate-800 font-medium">{title}</span><span className="text-slate-400"> — {sub}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviso: compartir métricas con el distribuidor (activo por defecto) */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-[#2E7CF6] shrink-0" />
                  <p className="text-sm font-semibold text-slate-700">Compartir métricas con {distribuidor}</p>
                  <span className="ml-auto text-[11px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">Activo por defecto</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Para ofrecerte un mejor servicio, estas métricas agregadas se compartirán con {distribuidor}.
                  Quedan <b>activadas por defecto</b>; podrás desactivarlas cuando quieras desde Ajustes &gt; Privacidad.
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Datos de volumen (trabajos por tipo de proceso)",
                    "Alertas de inventario (categorías bajo mínimo)",
                    "Actividad general (días de uso, usuarios activos)",
                  ].map((label) => (
                    <li key={label} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ChevronLeft className="w-4 h-4" /> Volver</Button>
                <Button onClick={enviar} className="flex-[2]">Crear mi entorno</Button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">Licencia ya abonada por tu distribuidor · no se requiere pago.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
