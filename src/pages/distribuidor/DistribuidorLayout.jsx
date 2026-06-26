import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, KeyRound, Users, LogOut, Package, Trophy, Bell } from "lucide-react";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";

const NAV = [
  { to: "/distribuidor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/distribuidor/referencias", label: "Referencias", icon: Package },
  { to: "/distribuidor/clientes", label: "Mis clientes", icon: Users },
  { to: "/distribuidor/alertas", label: "Alertas", icon: Bell },
  { to: "/distribuidor/ranking", label: "Rankings", icon: Trophy },
  { to: "/distribuidor/licencias", label: "Mis licencias", icon: KeyRound },
];

export default function DistribuidorLayout() {
  const { session, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar — fijo a la altura de la pantalla; sólo la navegación scrollea */}
      <aside className="w-60 bg-ink-gradient text-white flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-5 border-b border-white/10 shrink-0">
          <Logo variant="white" />
          <p className="text-xs text-slate-400 mt-1">Portal de distribuidor</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium", active ? "bg-[#2E7CF6] text-white" : "text-slate-300 hover:bg-white/10")}>
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-xs text-slate-400 px-3 mb-2 truncate">{session?.nombre}</p>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden bg-ink-gradient text-white px-4 h-14 flex items-center justify-between">
          <Logo variant="white" />
          <button onClick={() => { logout(); navigate("/"); }}><LogOut className="w-5 h-5" /></button>
        </div>
        <div className="md:hidden bg-white border-b border-slate-200 flex">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={cn("flex-1 text-center py-2.5 text-xs font-medium", active ? "text-[#2E7CF6] border-b-2 border-[#2E7CF6]" : "text-slate-500")}>
                {n.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
