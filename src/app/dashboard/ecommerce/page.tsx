import { getDatosCanales, getDefaultRange } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { DonutChart } from "@/components/charts/donut-chart";
import { KPICard } from "@/components/kpi/kpi-card";
import { DevPill } from "@/components/data/dev-pill";
import { Globe, ShoppingBag, Store, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_COLORS: Record<string, string> = {
  chs_web: "#2563EB", shiito_es: "#8B5CF6", amazon: "#FF9900", kibuc: "#0891B2",
  leroy_merlin: "#16A34A", media_markt: "#DC2626", carrefour: "#1E40AF", worten: "#F59E0B",
};
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  chs_web: <Globe size={16} />, shiito_es: <Store size={16} />, amazon: <Package size={16} />,
  kibuc: <Store size={16} />, leroy_merlin: <Store size={16} />, media_markt: <Store size={16} />,
  carrefour: <Store size={16} />, worten: <Store size={16} />,
};

export default async function EcommercePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultRange();
  const desde = (params.desde as string) || defaults.desde;
  const hasta = (params.hasta as string) || defaults.hasta;

  const canales = await getDatosCanales(desde, hasta);
  const activeCanales = canales.filter((c) => c.ventasReal > 0);
  const totalReal = activeCanales.reduce((sum, c) => sum + c.ventasReal, 0);
  const totalMargen = activeCanales.reduce((sum, c) => sum + c.margenReal, 0);
  const totalAnt = activeCanales.reduce((sum, c) => sum + c.ventasAnterior, 0);
  const hasAnterior = totalAnt > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 flex items-center justify-center">
          <DonutChart
            segments={activeCanales.map((c) => ({ label: c.nombre, value: c.ventasReal, color: CHANNEL_COLORS[c.codigo] || "#94A3B8" }))}
            size={180}
          />
        </div>
        <KPICard
          label="Total E-Commerce"
          value={fmtEur(totalReal)}
          sub={hasAnterior ? `Año ant: ${fmtK(totalAnt)} €` : undefined}
          trend={hasAnterior && totalAnt > 0 ? ((totalReal - totalAnt) / totalAnt) * 100 : undefined}
          icon={<ShoppingBag size={16} />}
        />
        <KPICard
          label="Margen Bruto Digital"
          value={fmtEur(totalMargen)}
          sub={`MB% ${pct(totalReal > 0 ? (totalMargen / totalReal) * 100 : 0)}`}
        />
        <KPICard
          label="Canales Activos"
          value={String(activeCanales.length)}
          sub={`de ${canales.length} totales`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activeCanales.map((canal) => (
          <div key={canal.codigo} className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: CHANNEL_COLORS[canal.codigo] || "#94A3B8" }}>
                {CHANNEL_ICONS[canal.codigo] || <Package size={16} />}
              </span>
              <span className="text-sm font-semibold text-[var(--chs-text-primary)]">{canal.nombre}</span>
            </div>
            <div className="kpi-value text-xl tabular-nums text-[var(--chs-text-primary)] mb-1">{fmtEur(canal.ventasReal)}</div>
            <div className="text-xs text-[var(--chs-text-muted)] mb-2">MB% {pct(canal.mbPct)}</div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[var(--chs-text-muted)]">
                  {totalReal > 0 ? ((canal.ventasReal / totalReal) * 100).toFixed(1).replace(".", ",") : "0,0"}% del total digital
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${totalReal > 0 ? Math.min((canal.ventasReal / totalReal) * 100, 100) : 0}%`,
                  backgroundColor: CHANNEL_COLORS[canal.codigo] || "#94A3B8",
                }} />
              </div>
            </div>
            {canal.ventasAnterior > 0 && (
              <div className="flex items-center justify-between text-xs text-[var(--chs-text-muted)]">
                <span>Año ant: {fmtK(canal.ventasAnterior)} €</span>
                <DevPill value={canal.pctAnterior} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
