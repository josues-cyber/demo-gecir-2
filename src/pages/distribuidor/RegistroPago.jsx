import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, User, Mail, Package, Shield, RefreshCw, CheckCircle2, Lock,
} from "lucide-react";
import { Button, Field, Input, Label } from "../../components/ui";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { db } from "../../lib/store";

const PROV_STEPS = [
  "Validando el pago...",
  "Creando tu portal de distribuidor...",
  "Generando el pool de licencias...",
];

function hex(n, seed) {
  // Genera un bloque hex pseudo-aleatorio determinista (sin Math.random, válido en demo).
  const chars = "0123456789ABCDEF";
  let out = "";
  let x = seed * 2654435761 + n * 40503;
  for (let i = 0; i < 12; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    out += chars[x % 16];
  }
  return out;
}

export default function DistribuidorRegistroPago() {
  const navigate = useNavigate();
  const { loginDistribuidor } = useAuth();
  const [stage, setStage] = useState("payment"); // payment | processing | provisioning | done
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ numero: "4242 4242 4242 4242", exp: "12/28", cvc: "123", titular: "" });
  const setC = (k) => (e) => setCard((c) => ({ ...c, [k]: e.target.value }));

  const resumen = JSON.parse(sessionStorage.getItem("dist_registro_resumen") || "null") || {
    nombre: "Nuevo Distribuidor", email: "demo@distribuidora.com", cantidad: 5, precio_unit: 450, total: 2250,
  };

  function pagar(e) {
    e.preventDefault();
    setStage("processing");
    setTimeout(() => setStage("provisioning"), 1200);
  }

  // Avance de los pasos de aprovisionamiento
  useEffect(() => {
    if (stage !== "provisioning") return;
    if (step < PROV_STEPS.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 1100);
      return () => clearTimeout(t);
    }
    // Último paso: generar licencias en el pool y terminar
    const t = setTimeout(() => {
      db.update((s) => {
        const baseId = s.licencias.reduce((m, l) => Math.max(m, l.id), 0) + 1;
        for (let i = 0; i < resumen.cantidad; i++) {
          s.licencias.push({
            id: baseId + i,
            license_key: `GECIR-${hex(i, baseId)}`,
            estado: "disponible",
            email: "",
            empresa: "",
            proveedor: resumen.nombre || "REPRISE",
            vencimiento: null,
            almacenamiento_mb: 0,
            db_status: "—",
            pausada: false,
          });
        }
      });
      setStage("done");
    }, 1100);
    return () => clearTimeout(t);
  }, [stage, step]); // eslint-disable-line

  // Tras "done", login y redirección al panel
  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(() => {
      loginDistribuidor(resumen.email);
      sessionStorage.removeItem("dist_registro_resumen");
      navigate("/distribuidor/dashboard");
    }, 1700);
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
            <h1 className="text-xl font-bold text-slate-900">Confirmar compra</h1>
            <p className="text-xs text-slate-500 mt-1">Activa tu cuenta de distribuidor</p>
          </div>

          {/* Resumen */}
          <div className="space-y-3 mb-5">
            <ResumenRow icon={User} label="Distribuidor" value={resumen.nombre} />
            <ResumenRow icon={Mail} label="Cuenta" value={resumen.email} />
            <ResumenRow icon={Package} label="Pool de licencias" value={`${resumen.cantidad} licencias × $${resumen.precio_unit}/año`} />
          </div>

          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
            <div>
              <p className="font-medium text-slate-800 text-sm">Total a pagar</p>
              <p className="text-xs text-slate-400">Facturación anual · renovación automática</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${resumen.total}<span className="text-sm font-normal text-slate-400">/año</span>
            </p>
          </div>

          {/* Datos de tarjeta */}
          <form onSubmit={pagar} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> Número de tarjeta</Label>
              <Input value={card.numero} onChange={setC("numero")} placeholder="0000 0000 0000 0000" inputMode="numeric" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Caducidad"><Input value={card.exp} onChange={setC("exp")} placeholder="MM/AA" className="font-mono" /></Field>
              <Field label="CVC"><Input value={card.cvc} onChange={setC("cvc")} placeholder="123" className="font-mono" /></Field>
            </div>
            <Field label="Titular de la tarjeta"><Input value={card.titular} onChange={setC("titular")} placeholder={resumen.nombre} /></Field>

            <Button type="submit" size="lg" className="w-full h-12" disabled={stage === "processing"}>
              {stage === "processing" ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando pago...</>
              ) : (
                <><Lock className="w-4 h-4" /> Pagar ${resumen.total}</>
              )}
            </Button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" /> Pago seguro simulado — entorno de demostración
          </p>
        </div>
      )}

      {stage === "provisioning" && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#2E7CF6] animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-bold text-slate-900">Activando tu cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">{PROV_STEPS[step]}</p>
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {PROV_STEPS.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-[#2E7CF6]" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">¡Cuenta activada!</h1>
          <p className="text-sm text-slate-500 mt-1">
            {resumen.cantidad} licencias añadidas a tu pool. Redirigiendo al panel...
          </p>
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
