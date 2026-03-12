import { RadialGauge } from "@/components/charts/radial-gauge";

interface CategoryCardProps {
  nombre: string;
  icono: string;
  color: string;
  colorLight: string;
  ventasReal: number;
  ventasObjetivo: number;
  pctObjetivo: number;
  mbPct: number;
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
  ventasObjetivo,
  pctObjetivo,
  mbPct,
  onClick,
  active,
}: CategoryCardProps) {
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
      <div className="flex items-center gap-4">
        <RadialGauge value={pctObjetivo} size={72} strokeWidth={7} />
        <div>
          <div className="kpi-value text-xl tabular-nums" style={{ color }}>
            {fmtK(ventasReal)} €
          </div>
          <div className="text-[11px] text-[var(--chs-text-muted)]">
            de {fmtK(ventasObjetivo)} € obj.
          </div>
          <div className="mt-1 text-xs font-semibold" style={{ color }}>
            MB {mbPct.toFixed(1).replace(".", ",")}%
          </div>
        </div>
      </div>
    </div>
  );
}
