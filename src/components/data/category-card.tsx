interface CategoryCardProps {
  nombre: string;
  icono: string;
  color: string;
  colorLight: string;
  ventasReal: number;
  totalVentas: number;
  onClick?: () => void;
  active?: boolean;
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return new Intl.NumberFormat("es-ES").format(n);
}

export function CategoryCard({
  nombre,
  icono,
  color,
  colorLight,
  ventasReal,
  totalVentas,
  onClick,
  active,
}: CategoryCardProps) {
  const pctTotal = totalVentas > 0 ? (ventasReal / totalVentas) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-5 shadow-sm transition-all cursor-pointer hover:shadow-md ${
        active ? "ring-2 ring-offset-1" : ""
      }`}
      style={{
        borderColor: active ? color : "var(--chs-border)",
        ...(active ? { ringColor: color } : {}),
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
          style={{ backgroundColor: colorLight }}
        >
          {icono}
        </span>
        <span className="text-sm font-semibold text-[var(--chs-text-primary)]">{nombre}</span>
      </div>
      <div>
        <div className="kpi-value text-xl tabular-nums" style={{ color }}>
          {fmtK(ventasReal)} €
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[var(--chs-text-muted)]">
              {pctTotal.toFixed(1).replace(".", ",")}% del total
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pctTotal, 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
