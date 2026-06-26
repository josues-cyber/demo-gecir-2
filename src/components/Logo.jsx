// Logo de marca GECIR (engranaje azul). Imagen real solologoGecirBlanco.png.
// `withText` muestra el wordmark "GECIR" junto al icono (color según variante).
export function Logo({ variant = "dark", className = "", withText = true }) {
  const isWhite = variant === "white";
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <img
        src="/images/solologoGecirBlanco.png"
        alt="GECIR"
        className="h-8 w-auto select-none"
        draggable={false}
      />
      {withText && (
        <span className={isWhite ? "text-white" : "text-slate-900"} style={{ fontSize: "1.15rem" }}>
          GECIR
        </span>
      )}
    </span>
  );
}
