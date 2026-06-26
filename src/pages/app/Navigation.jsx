import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Plus, Briefcase, Users, Wallet, Package,
  ChevronDown, LogOut, Settings, Menu, X, RotateCcw,
} from "lucide-react";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { db } from "../../lib/store";
import { cn } from "../../lib/cn";

function useClickOutside(onOut) {
  const ref = useRef(null);
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) onOut();
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onOut]);
  return ref;
}

function NavDropdown({ label, icon: Icon, items, active }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold uppercase tracking-wide rounded-lg transition-colors",
          active ? "text-[#2E7CF6]" : "text-slate-600 hover:text-[#2E7CF6]"
        )}
      >
        {Icon && <Icon className="w-4 h-4" />} {label} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-[#2E7CF6] hover:text-white transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const MENU = [
  { type: "link", to: "/app", label: "Inicio", icon: Home },
  {
    type: "dropdown", label: "Nuevo", icon: Plus,
    items: [
      { to: "/app/trabajos/nuevo", label: "Trabajo" },
      { to: "/app/presupuestos/nuevo", label: "Presupuesto" },
      { to: "/app/clientes/nuevo", label: "Cliente" },
    ],
  },
  {
    type: "dropdown", label: "Trabajos", icon: Briefcase, match: "/app/trabajos",
    items: [
      { to: "/app/trabajos", label: "Todos los trabajos" },
      { to: "/app/trabajos/sin-asignar", label: "Sin asignar" },
      { to: "/app/trabajos/pendientes", label: "Pendientes" },
      { to: "/app/trabajos/presupuestar", label: "Presupuestar" },
      { to: "/app/trabajos/produccion", label: "Producción" },
      { to: "/app/trabajos/para-entregar", label: "Para entregar" },
      { to: "/app/trabajos/entregados", label: "Entregados" },
    ],
  },
  {
    type: "dropdown", label: "Clientes", icon: Users, match: "/app/clientes",
    items: [
      { to: "/app/clientes", label: "Ver clientes" },
      { to: "/app/clientes/nuevo", label: "Nuevo cliente" },
    ],
  },
  {
    type: "dropdown", label: "Finanzas", icon: Wallet, match: "/app/(presupuestos|albaranes|facturas|caja)",
    items: [
      { to: "/app/presupuestos", label: "Presupuestos" },
      { to: "/app/albaranes", label: "Albaranes" },
      { to: "/app/facturas", label: "Facturas" },
      { to: "/app/caja", label: "Caja" },
    ],
  },
  {
    type: "dropdown", label: "Inventario", icon: Package, match: "/app/inventario",
    items: [
      { to: "/app/inventario", label: "Dashboard" },
      { to: "/app/inventario/productos", label: "Productos" },
      { to: "/app/inventario/movimientos", label: "Movimientos" },
      { to: "/app/inventario/categorias", label: "Categorías" },
      { to: "/app/inventario/alertas", label: "Alertas" },
      { to: "/app/inventario/ofertas-pbs", label: "Ofertas PBS" },
      { to: "/app/inventario/proveedores", label: "Proveedores" },
    ],
  },
];

const ADMIN_ITEMS = [
  { to: "/app/admin/usuarios", label: "Usuarios" },
  { to: "/app/admin/roles", label: "Roles" },
  { to: "/app/admin/licencias", label: "Licencias" },
  { to: "/app/admin/configuracion", label: "Configuración" },
];

export default function Navigation() {
  const { session, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(item) {
    if (item.type === "link") return pathname === item.to;
    if (item.match) return new RegExp(`^${item.match}`).test(pathname);
    return false;
  }

  function doLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 no-print">
      {/* Fila superior azul */}
      <div className="bg-[#0066ff] text-white">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2">
            <Logo variant="white" />
            <span className="text-xs text-blue-200 hidden sm:inline">by Reprise</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-100 hidden md:inline mr-2">{session?.empresa}</span>
            {isSuperAdmin && (
              <AdminDropdown />
            )}
            <button onClick={doLogout} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5">
              <LogOut className="w-4 h-4" /> Salir
            </button>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden ml-1 p-1.5">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fila inferior blanca con menú */}
      <div className="bg-white border-b border-slate-200 hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-center gap-1">
          {MENU.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold uppercase tracking-wide rounded-lg",
                  isActive(item) ? "text-[#2E7CF6]" : "text-slate-600 hover:text-[#2E7CF6]"
                )}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ) : (
              <NavDropdown key={item.label} {...item} active={isActive(item)} />
            )
          )}
        </div>
      </div>

      {/* Menú mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-800 text-white overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <Logo variant="white" />
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              <MobileLink to="/app" label="Inicio" onClick={() => setMobileOpen(false)} />
              {MENU.filter((m) => m.type === "dropdown").map((m) => (
                <div key={m.label} className="pt-2">
                  <p className="text-xs uppercase text-slate-400 px-3 pb-1">{m.label}</p>
                  {m.items.map((it) => (
                    <MobileLink key={it.to} to={it.to} label={it.label} onClick={() => setMobileOpen(false)} />
                  ))}
                </div>
              ))}
              {isSuperAdmin && (
                <div className="pt-2">
                  <p className="text-xs uppercase text-slate-400 px-3 pb-1">Admin</p>
                  {ADMIN_ITEMS.map((it) => (
                    <MobileLink key={it.to} to={it.to} label={it.label} onClick={() => setMobileOpen(false)} />
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function AdminDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  function reiniciar() {
    if (window.confirm("¿Reiniciar la demo? Se restaurarán todos los datos de ejemplo.")) {
      db.reset();
      setOpen(false);
    }
  }
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5">
        <Settings className="w-4 h-4" /> Admin <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
          {ADMIN_ITEMS.map((it) => (
            <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-[#2E7CF6] hover:text-white">
              {it.label}
            </Link>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <button onClick={reiniciar} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
            <RotateCcw className="w-4 h-4" /> Reiniciar demo
          </button>
        </div>
      )}
    </div>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700">
      {label}
    </Link>
  );
}
