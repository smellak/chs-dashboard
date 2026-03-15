import { fmtK } from "@/lib/format";

interface CategoryCardProps {
  nombre: string;
  icono: string;
  color: string;
  colorLight: string;
  ventasReal: number;
  totalVentas: number;
  mbPct?: number;
}

export function CategoryCard({ nombre, icono, color, colorLight, ventasReal, totalVentas, mbPct }: CategoryCardProps) {
  const pctTotal = totalVentas > 0 ? (ventasReal / totalVentas) * 100 : 0;

  return (
    <div
      className="rounded-xl border bg-white p-4 shadow-sm"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icono}</span>
        <span className="text-sm font-semibold text-[var(--chs-text-primary)]">{nombre}</span>
      </div>
      <div className="kpi-value text-xl tabular-nums" style={{ color }}>
        {fmtK(ventasReal)}€
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-[var(--chs-text-muted)]">
          {pctTotal.toFixed(1).replace(".", ",")}% del total
        </span>
        {mbPct !== undefined && (
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
            MB% {mbPct.toFixed(1).replace(".", ",")}%
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: colorLight }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pctTotal, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
