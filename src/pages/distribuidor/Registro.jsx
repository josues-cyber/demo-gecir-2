import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Users, BarChart3, Shield, Eye, EyeOff, Minus, Plus, AlertCircle } from "lucide-react";
import AuthShell, { SideFeatures } from "../auth/AuthShell";
import { Field, Input, Label, Button } from "../../components/ui";

export const PRECIO_UNIT_DIST = 450;

export default function DistribuidorRegistro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", password2: "" });
  const [cantidad, setCantidad] = useState(5);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const PRECIO_UNIT = PRECIO_UNIT_DIST;

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.email) return setError("Completa nombre y email.");
    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (form.password !== form.password2) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem(
        "dist_registro_resumen",
        JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          cantidad,
          precio_unit: PRECIO_UNIT,
          total: cantidad * PRECIO_UNIT,
        })
      );
      navigate("/distribuidor/registro/pago");
    }, 600);
  }

  return (
    <AuthShell
      side={
        <SideFeatures
          title="Vende GECIR a tus clientes."
          subtitle="Compra licencias en bloque, asígnalas a tus clientes y gestiona todo desde tu panel de distribuidor."
          items={[
            { icon: Package, label: "Pool de licencias gestionable" },
            { icon: Users, label: "Panel de clientes con métricas" },
            { icon: BarChart3, label: "Ranking y alertas automáticas" },
            { icon: Shield, label: "Acceso seguro con 2FA" },
          ]}
        />
      }
    >
      <h2 className="text-2xl font-bold text-slate-900">Registro de Distribuidor</h2>
      <p className="text-slate-500 text-sm mt-1">Crea tu cuenta para empezar a vender GECIR</p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Nombre / Empresa"><Input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre o empresa" /></Field>
        <Field label="Email de acceso al portal"><Input type="email" value={form.email} onChange={set("email")} placeholder="tu@empresa.com" /></Field>
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

        <div className="space-y-2">
          <Label>Cantidad de licencias</Label>
          <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50">
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-bold text-slate-900">{cantidad}</span>
              <span className="text-sm text-slate-400 ml-1">lic.</span>
            </div>
            <button type="button" onClick={() => setCantidad((c) => Math.min(500, c + 1))} className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-3">
            <div>
              <p className="text-xs font-medium text-blue-600">{cantidad} licencias × ${PRECIO_UNIT}/año</p>
              <p className="text-xs text-slate-400">Facturación anual</p>
            </div>
            <p className="text-xl font-bold text-blue-700">${cantidad * PRECIO_UNIT}</p>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : "Continuar al pago"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link to="/distribuidor/login" className="text-[#2E7CF6] underline">Inicia sesión</Link>
      </p>
    </AuthShell>
  );
}
