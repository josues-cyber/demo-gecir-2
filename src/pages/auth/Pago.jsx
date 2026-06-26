import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Building2, Mail, Globe, Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";

const DB_STEPS = [
  { key: "CREATING", label: "Creando base de datos..." },
  { key: "SEEDING", label: "Cargando datos iniciales..." },
  { key: "READY", label: "Configurando tu entorno..." },
];

export default function Pago() {
  const navigate = useNavigate();
  const { loginUsuario } = useAuth();
  const [stage, setStage] = useState("payment"); // payment | creating_db | done
  const [dbStep, setDbStep] = useState(0);
  const resumen = JSON.parse(sessionStorage.getItem("pre_activar_resumen") || "null") || {
    nombre: "Nuevo Usuario", email: "demo@empresa.com", company_name: "Mi Imprenta S.L.",
    distribuidor: "Reprise (directo)", precio: 49, moneda: "EUR",
  };

  function pagar() {
    setStage("processing");
    setTimeout(() => setStage("creating_db"), 1200);
  }

  useEffect(() => {
    if (stage !== "creating_db") return;
    if (dbStep < DB_STEPS.length - 1) {
      const t = setTimeout(() => setDbStep((s) => s + 1), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage("done"), 1100);
    return () => clearTimeout(t);
  }, [stage, dbStep]);

  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(() => {
      loginUsuario(resumen.email);
      navigate("/app");
    }, 1600);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-6 py-12">
      <div className="opacity-50 mb-10">
        <Logo />
      </div>

      {(stage === "payment" || stage === "processing") && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-[#2E7CF6]" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Confirmar pago</h1>
            <p className="text-xs text-slate-500 mt-1">Paso final para activar tu licencia</p>
          </div>

          <div className="space-y-3 mb-5">
            <ResumenRow icon={Building2} label="Empresa" value={resumen.company_name} />
            <ResumenRow icon={Mail} label="Cuenta" value={`${resumen.nombre} · ${resumen.email}`} />
            <ResumenRow icon={Globe} label="Distribuidor" value={resumen.distribuidor} />
          </div>

          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
            <div>
              <p className="font-medium text-slate-800 text-sm">Licencia anual GECIR</p>
              <p className="text-xs text-slate-400">Renovación automática anual</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {resumen.precio}€<span className="text-sm font-normal text-slate-400">/año</span>
            </p>
          </div>

          <Button onClick={pagar} size="lg" className="w-full h-12" disabled={stage === "processing"}>
            {stage === "processing" ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando pago...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Pagar {resumen.precio}€</>
            )}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" /> Pago seguro simulado — entorno de demostración
          </p>
        </div>
      )}

      {stage === "creating_db" && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#2E7CF6] animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-bold text-slate-900">Preparando tu espacio</h1>
          <p className="text-sm text-slate-500 mt-1">{DB_STEPS[dbStep].label}</p>
          <p className="text-xs text-slate-400 mt-4">
            Se está creando una base de datos aislada solo para tu empresa.
          </p>
        </div>
      )}

      {stage === "done" && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">¡Todo listo!</h1>
          <p className="text-sm text-slate-500 mt-1">Tu licencia ha sido activada. Redirigiendo al panel...</p>
        </div>
      )}
    </div>
  );
}

function ResumenRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
