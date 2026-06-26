import { Link } from "react-router-dom";
import { Logo } from "../../components/Logo";

// Layout de dos paneles usado en login / sign-up / distribuidor.
export default function AuthShell({ side, children }) {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo (solo desktop) */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] bg-ink-gradient relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl opacity-10" style={{ background: "#2E7CF6" }} />
        <Link to="/">
          <Logo variant="white" />
        </Link>
        <div className="relative">{side}</div>
        <p className="text-xs text-slate-600">© 2026 GECIR by Reprise. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SideFeatures({ title, subtitle, items }) {
  return (
    <div>
      <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">{title}</h2>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed mb-10">{subtitle}</p>
      <ul className="space-y-4">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(46,124,246,0.15)" }}>
              <Icon className="w-4 h-4" style={{ color: "#60a5fa" }} />
            </span>
            <span className="text-sm text-slate-300">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
