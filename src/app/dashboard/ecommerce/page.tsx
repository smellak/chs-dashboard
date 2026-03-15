import { getDatosCanales, getLatestPeriod } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { DonutChart } from "@/components/charts/donut-chart";
import { KPICard } from "@/components/kpi/kpi-card";
import { DevPill } from "@/components/data/dev-pill";
import { ProgressBar } from "@/components/charts/progress-bar";
import { Globe, ShoppingBag, Store, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_COLORS: Record<string, string> = {
  chs_web: "#2563EB",
  shiito_es: "#8B5CF6",
  amazon: "#FF9900",
  kibuc: "#0891B2",
  leroy_merlin: "#16A34A",
  media_markt: "#DC2626",
  carrefour: "#1E40AF",
  worten: "#F59E0B",
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  chs_web: <Globe size={16} />,
  shiito_es: <Store size={16} />,
  amazon: <Package size={16} />,
  kibuc: <Store size={16} />,
  leroy_merlin: <Store size={16} />,
  media_markt: <Store size={16} />,
  carrefour: <Store size={16} />,
  worten: <Store size={16} />,
};

export default async function EcommercePage() {
  const { anio, mes } = await getLatestPeriod();
  const canales = await getDatosCanales(anio, mes);

  const totalReal = canales.reduce((sum, c) => sum + c.ventasReal, 0);
  const totalObj = canales.reduce((sum, c) => sum + c.ventasObjetivo, 0);
  const totalAnt = canales.reduce((sum, c) => sum + c.ventasAnterior, 0);
  const hasObjetivos = totalObj > 0;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 flex items-center justify-center">
          <DonutChart
            segments={canales
              .filter((c) => c.ventasReal > 0)
              .map((c) => ({
                label: c.nombre,
                value: c.ventasReal,
                color: CHANNEL_COLORS[c.codigo] || "#94A3B8",
              }))}
            size={180}
          />
        </div>
        <KPICard
          label="Total E-Commerce"
          value={fmtEur(totalReal)}
          sub={hasObjetivos ? `Obj: ${fmtK(totalObj)} €` : `Año ant: ${fmtK(totalAnt)} €`}
          trend={hasObjetivos ? ((totalReal / totalObj) * 100) - 100 : (totalAnt > 0 ? ((totalReal - totalAnt) / totalAnt) * 100 : 0)}
          icon={<ShoppingBag size={16} />}
        />
        <KPICard
          label={hasObjetivos ? "vs Objetivo" : "Canales Activos"}
          value={hasObjetivos ? pct((totalReal / totalObj) * 100) : String(canales.filter(c => c.ventasReal > 0).length)}
          sub={hasObjetivos ? "cumplimiento total" : "con ventas este mes"}
        />
        <KPICard
          label="vs Año Anterior"
          value={fmtEur(totalReal - totalAnt)}
          trend={totalAnt > 0 ? ((totalReal - totalAnt) / totalAnt) * 100 : 0}
          sub={`${fmtK(totalAnt)} € en ${anio - 1}`}
        />
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canales.map((canal) => (
          <div
            key={canal.codigo}
            className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: CHANNEL_COLORS[canal.codigo] || "#94A3B8" }}
              >
                {CHANNEL_ICONS[canal.codigo] || <Package size={16} />}
              </span>
              <span className="text-sm font-semibold text-[var(--chs-text-primary)]">
                {canal.nombre}
              </span>
            </div>

            <div className="kpi-value text-xl tabular-nums text-[var(--chs-text-primary)] mb-1">
              {fmtEur(canal.ventasReal)}
            </div>

            {canal.ventasObjetivo > 0 && (
              <ProgressBar
                value={canal.ventasReal}
                max={canal.ventasObjetivo}
                color={CHANNEL_COLORS[canal.codigo]}
              />
            )}

            {canal.ventasObjetivo > 0 && (
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--chs-text-muted)]">
                <span>Obj: {fmtK(canal.ventasObjetivo)} €</span>
                <DevPill value={canal.pctObjetivo - 100} />
              </div>
            )}

            <div className="mt-1 flex items-center justify-between text-xs text-[var(--chs-text-muted)]">
              <span>Año ant: {fmtK(canal.ventasAnterior)} €</span>
              <DevPill value={canal.pctAnterior} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
