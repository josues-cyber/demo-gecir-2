import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Printer, Users, BarChart3, FileText, Eye, EyeOff } from "lucide-react";
import AuthShell, { SideFeatures } from "./AuthShell";
import { Field, Input, Label, Button } from "../../components/ui";
import { useAuth, DEMO_ACCOUNTS } from "../../lib/auth";

export default function Login() {
  const { loginUsuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ACCOUNTS.usuario.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.usuario.password);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginUsuario(email);
      navigate("/app");
    }, 500);
  }

  return (
    <AuthShell
      side={
        <SideFeatures
          title="Tu imprenta, organizada."
          subtitle="Gestiona trabajos, clientes y facturación desde un único lugar, diseñado para artes gráficas."
          items={[
            { icon: Printer, label: "Gestión completa de trabajos y estados" },
            { icon: Users, label: "Clientes, presupuestos y facturas" },
            { icon: BarChart3, label: "Estadísticas y control de caja" },
            { icon: FileText, label: "Albaranes y notas de entrega" },
          ]}
        />
      }
    >
      <h2 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h2>
      <p className="text-slate-500 text-sm mt-1">Accede a tu cuenta de GECIR</p>

      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-700">
        Demo: las credenciales ya están rellenadas. Pulsa <b>Iniciar sesión</b> para entrar al panel de empresa.
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" />
        </Field>
        <div className="space-y-1.5">
          <Label>Contraseña</Label>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500 text-center">
        ¿Tienes una clave de licencia?{" "}
        <Link to="/auth/login-empresa" className="text-[#2E7CF6] underline">
          Acceder con licencia
        </Link>
      </p>
    </AuthShell>
  );
}
