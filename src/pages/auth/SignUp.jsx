import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Printer, Users, BarChart3, FileText, Eye, EyeOff, Building2, AlertCircle } from "lucide-react";
import AuthShell, { SideFeatures } from "./AuthShell";
import { Field, Input, Label, Button, Select } from "../../components/ui";

const PAISES = ["España", "Portugal", "Francia", "Ecuador", "México", "Colombia", "Argentina"];

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", apellidos: "", email: "", company_name: "", country: "España",
    password: "", password2: "",
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.email || !form.company_name) return setError("Completa los campos obligatorios.");
    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (form.password !== form.password2) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem(
        "pre_activar_resumen",
        JSON.stringify({
          nombre: `${form.nombre} ${form.apellidos}`.trim(),
          email: form.email,
          company_name: form.company_name,
          distribuidor: "Reprise (directo)",
          precio: 49,
          moneda: "EUR",
        })
      );
      navigate("/auth/pago");
    }, 500);
  }

  return (
    <AuthShell
      side={
        <SideFeatures
          title="Empieza a gestionar tu imprenta hoy."
          subtitle="Accede a todas las herramientas que necesita tu negocio."
          items={[
            { icon: Printer, label: "Gestión completa de trabajos y estados" },
            { icon: Users, label: "Clientes, presupuestos y facturas" },
            { icon: BarChart3, label: "Estadísticas y control de caja" },
            { icon: FileText, label: "Albaranes y notas de entrega" },
          ]}
        />
      }
    >
      <h2 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h2>
      <p className="text-slate-500 text-sm mt-1">Rellena los datos para solicitar tu licencia</p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre"><Input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" /></Field>
          <Field label="Apellidos"><Input value={form.apellidos} onChange={set("apellidos")} placeholder="Apellidos" /></Field>
        </div>
        <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} placeholder="tu@empresa.com" /></Field>
        <div className="space-y-1.5">
          <Label>Nombre de la empresa</Label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={form.company_name} onChange={set("company_name")} placeholder="Mi Imprenta S.L." className="pl-9" />
          </div>
        </div>
        <Field label="País">
          <Select value={form.country} onChange={set("country")}>
            {PAISES.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </Field>
        <div className="space-y-1.5">
          <Label>Contraseña</Label>
          <div className="relative">
            <Input type={show ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" className="pr-10" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Field label="Repetir contraseña"><Input type="password" value={form.password2} onChange={set("password2")} placeholder="Repite tu contraseña" /></Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : "Continuar al pago"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link to="/auth/login" className="text-[#2E7CF6] underline">Inicia sesión</Link>
      </p>
    </AuthShell>
  );
}
