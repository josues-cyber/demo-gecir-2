import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Printer,
  Users,
  BarChart3,
  FileText,
  Package,
  Calculator,
} from "lucide-react";
import { Logo } from "../components/Logo";

const features = [
  { icon: Printer, color: "#3b82f6", title: "Gestión de trabajos", desc: "Controla el ciclo completo de cada trabajo con estados personalizables y trazabilidad total." },
  { icon: Users, color: "#8b5cf6", title: "Clientes y presupuestos", desc: "Directorio de clientes, presupuestos rápidos y conversión directa a facturas o albaranes." },
  { icon: BarChart3, color: "#10b981", title: "Control financiero", desc: "Ingresos, gastos y balance en tiempo real. Caja diaria y reportes mensuales." },
  { icon: FileText, color: "#f59e0b", title: "Facturación completa", desc: "Facturas, albaranes y notas de entrega. Envío por email directo al cliente." },
  { icon: Package, color: "#ec4899", title: "Inventario", desc: "Control de stock, alertas de mínimos y gestión de proveedores integrada." },
  { icon: Calculator, color: "#06b6d4", title: "Multi-empresa", desc: "Cada empresa tiene su base de datos aislada. Seguridad y privacidad garantizadas." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-gradient">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10" style={{ background: "#2E7CF6" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-3xl opacity-10" style={{ background: "#8b5cf6" }} />

        <header className="relative max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Logo variant="white" />
          <div className="flex items-center gap-3">
            <Link to="/distribuidor/login" className="text-sm text-slate-300 hover:text-white hidden sm:block">
              Soy distribuidor
            </Link>
            <Link to="/auth/login" className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2">
              Iniciar sesión
            </Link>
          </div>
        </header>

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-28 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm mb-7"
            style={{ background: "rgba(46,124,246,0.15)", border: "1px solid rgba(46,124,246,0.25)", color: "#60a5fa" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7CF6] animate-pulse-dot" />
            ERP para artes gráficas e imprentas
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
            Tu imprenta,
            <br />
            <span style={{ color: "#2E7CF6" }}>organizada.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Gestiona trabajos, clientes, facturación e inventario desde un único lugar. Diseñado específicamente
            para imprentas y artes gráficas.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/login" className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-semibold text-white bg-[#2E7CF6] hover:bg-[#1d63d8]">
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/distribuidor/registro" className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white">
              Solicitar licencia
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Todo lo que necesitas</h2>
          <p className="mt-2 text-base text-slate-500 max-w-md mx-auto">
            Una plataforma completa pensada para el día a día de tu imprenta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}1A` }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-ink-gradient rounded-2xl p-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">¿Listo para empezar?</h2>
          <p className="mt-2 text-slate-400 max-w-md mx-auto">
            Solicita tu licencia y ten tu imprenta organizada en minutos.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/sign-up" className="inline-flex items-center gap-2 h-11 px-7 rounded-xl font-semibold text-white bg-[#2E7CF6] hover:bg-[#1d63d8]">
              Solicitar licencia <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/auth/login" className="inline-flex items-center gap-2 h-11 px-7 rounded-xl font-semibold text-slate-300 hover:bg-slate-800">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <p className="text-center text-xs text-slate-400">
          © 2026 GECIR by Reprise · Sistema de Gestión para Artes Gráficas ·{" "}
          <span className="text-[#2E7CF6]">Demo de demostración</span>
        </p>
      </footer>
    </div>
  );
}
