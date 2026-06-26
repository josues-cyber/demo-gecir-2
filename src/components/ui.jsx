// Primitivas UI reutilizables (estilo shadcn/Radix del proyecto original).
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "../lib/cn";

/* ---------------- Button ---------------- */
const btnVariants = {
  primary: "bg-[#2E7CF6] text-white hover:bg-[#1d63d8] shadow-sm",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
};
const btnSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};
export function Button({ variant = "primary", size = "md", className, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }) {
  return <div className={cn("bg-white border border-slate-200 rounded-2xl", className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 border-b border-slate-100", className)} {...props} />;
}
export function CardBody({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

/* ---------------- Badge ---------------- */
export function Badge({ color, className, style, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={style}
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

/* ---------------- Form fields ---------------- */
export function Label({ className, ...props }) {
  return <label className={cn("block text-sm font-medium text-slate-700", className)} {...props} />;
}
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2E7CF6] focus:ring-2 focus:ring-[#2E7CF6]/20",
        className
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2E7CF6] focus:ring-2 focus:ring-[#2E7CF6]/20",
        className
      )}
      {...props}
    />
  );
}
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2E7CF6] focus:ring-2 focus:ring-[#2E7CF6]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
export function Field({ label, children, hint, required }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-sm text-slate-700 select-none", className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#2E7CF6] focus:ring-[#2E7CF6]" {...props} />
      {label}
    </label>
  );
}

/* ---------------- Table ---------------- */
export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}
export function Th({ className, ...props }) {
  return <th className={cn("text-left font-semibold text-slate-500 text-xs uppercase tracking-wide px-3 py-2.5", className)} {...props} />;
}
export function Td({ className, ...props }) {
  return <td className={cn("px-3 py-2.5 text-slate-700 align-middle", className)} {...props} />;
}

/* ---------------- Page header ---------------- */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className={cn("bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="text-center py-16 text-slate-400">
      {Icon && <Icon className="w-10 h-10 mx-auto mb-3 opacity-50" />}
      <p className="font-medium text-slate-500">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}

/* ---------------- Toast system ---------------- */
const ToastContext = createContext(null);
let toastId = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, message) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const api = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 left-5 z-[60] space-y-2 no-print">
        {toasts.map((t) => {
          const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? AlertCircle : Info;
          const color = t.type === "success" ? "text-green-600" : t.type === "error" ? "text-red-600" : "text-[#2E7CF6]";
          return (
            <div key={t.id} className="flex items-center gap-3 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 min-w-[260px] animate-[fadeIn_.2s]">
              <Icon className={cn("w-5 h-5 shrink-0", color)} />
              <span className="text-sm text-slate-700">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  return useContext(ToastContext);
}
