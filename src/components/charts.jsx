// Gráficas reutilizables (sobre recharts) con estilo coherente con la demo.
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

const BRAND = "#2E7CF6";

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
  labelStyle: { color: "#64748b", fontWeight: 600 },
};

/** Evolutivo de facturación (área degradada). data: [{mes, importe}] */
export function FacturacionChart({ data, height = 220, formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={48}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
        <Tooltip {...tooltipStyle} formatter={(v) => [formatter ? formatter(v) : v, "Facturación"]} />
        <Area type="monotone" dataKey="importe" stroke={BRAND} strokeWidth={2.5} fill="url(#gradFact)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Barras horizontales de top referencias. data: [{nombre, valor}] */
export function TopBarsChart({ data, height = 220, color = BRAND, formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
        <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={130} />
        <Tooltip {...tooltipStyle} formatter={(v) => [formatter ? formatter(v) : v, ""]} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="valor" radius={[0, 6, 6, 0]} fill={color} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Barras verticales comparativas. data: [{label, valor}] con colores opcionales. */
export function CompareBars({ data, height = 200, colors = ["#cbd5e1", BRAND], formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={42}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
        <Tooltip {...tooltipStyle} formatter={(v) => [formatter ? formatter(v) : v, ""]} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={48}>
          {data.map((d, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Sparkline minimalista para tarjetas. data: number[] */
export function Sparkline({ data, height = 40, color = BRAND }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
