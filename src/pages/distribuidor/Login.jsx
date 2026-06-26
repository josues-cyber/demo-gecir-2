import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Building2 } from "lucide-react";
import AuthShell from "../auth/AuthShell";
import { Field, Input, Label, Button } from "../../components/ui";
import { useAuth, DEMO_ACCOUNTS } from "../../lib/auth";

export default function DistribuidorLogin() {
  const { loginDistribuidor } = useAuth();
  const navigate = useNavigate();
  const [stepOtp, setStepOtp] = useState(false);
  const [email, setEmail] = useState(DEMO_ACCOUNTS.distribuidor.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.distribuidor.password);
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function continuar(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStepOtp(true);
    }, 500);
  }
  function verificar(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginDistribuidor(email);
      navigate("/distribuidor/dashboard");
    }, 500);
  }

  return (
    <AuthShell
      side={
        <div>
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-6">
            <Building2 className="w-7 h-7 text-[#2E7CF6]" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">Portal de Distribuidor</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Accede al dashboard de tus clientes, revisa métricas de uso y gestiona el pool de licencias.
          </p>
        </div>
      }
    >
      {!stepOtp ? (
        <>
          <h2 className="text-2xl font-bold text-slate-900">Acceso distribuidor</h2>
          <p className="text-slate-500 text-sm mt-1">Introduce tus credenciales del portal</p>

          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-700">
            Demo: credenciales rellenadas. El código 2FA es cualquier número de 6 dígitos.
          </div>

          <form onSubmit={continuar} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@distribuidora.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-slate-400" /> Contraseña</Label>
              <div className="relative">
                <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            ¿No tienes cuenta?{" "}
            <Link to="/distribuidor/registro" className="text-[#2E7CF6] underline">Regístrate como distribuidor</Link>
          </p>
        </>
      ) : (
        <>
          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-[#2E7CF6]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verificación</h2>
            <p className="text-slate-500 text-sm mt-1">Introduce el código enviado a <b>{email}</b></p>
          </div>
          <form onSubmit={verificar} className="mt-6 space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              placeholder="000000"
              className="w-full h-14 text-2xl text-center tracking-widest font-mono rounded-lg border border-slate-300 outline-none focus:border-[#2E7CF6] focus:ring-2 focus:ring-[#2E7CF6]/20"
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length < 6}>
              {loading ? "Entrando..." : "Verificar y entrar"}
            </Button>
            <button type="button" onClick={() => setStepOtp(false)} className="w-full text-sm text-slate-500">← Volver</button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
