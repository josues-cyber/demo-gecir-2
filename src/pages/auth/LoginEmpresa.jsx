import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, Key } from "lucide-react";
import { Field, Input, Label, Button, Card } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { useAuth, DEMO_ACCOUNTS } from "../../lib/auth";

export default function LoginEmpresa() {
  const { loginUsuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ACCOUNTS.usuario.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.usuario.password);
  const [licenseKey, setLicenseKey] = useState("GECIR-4F8A2C9D1B3E");
  const [loading, setLoading] = useState(false);

  function submit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginUsuario(email);
      navigate("/app");
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>
        <Card className="shadow-lg">
          <div className="p-7">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Acceso a GECIR</h1>
              <p className="text-sm text-slate-500 mt-1">Inicia sesión con tu licencia de empresa</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-slate-400" /> Contraseña</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Key className="w-4 h-4 text-slate-400" /> Clave de Licencia</Label>
                <Input
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="Ej: GECIR-XXXXXXXXXXXX"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">Puedes copiar la clave que recibiste en tu email de activación</p>
              </div>

              <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-500 space-y-1">
              <p>
                ¿No tienes licencia?{" "}
                <Link to="/auth/sign-up" className="text-blue-600">Solicítala aquí</Link>
              </p>
              <p>
                <Link to="/auth/login" className="text-blue-600">Volver al acceso estándar</Link>
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-slate-600">
          💡 Consejo: La clave de licencia se envía automáticamente cuando se activa tu cuenta. Si no la encuentras,
          revisa spam o contacta soporte.
        </div>
      </div>
    </div>
  );
}
