import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getHeatmapData, getDefaultRange, getRangoAnterior } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { MainKPI } from "@/components/kpi/main-kpi";
import { KPICard } from "@/components/kpi/kpi-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryCard } from "@/components/data/category-card";
import { StoreTable } from "@/components/data/store-table";
import { Heatmap } from "@/components/charts/heatmap";
import { DevPill } from "@/components/data/dev-pill";
import { BarChart3, Store, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultRange();
  const desde = (params.desde as string) || defaults.desde;
  const hasta = (params.hasta as string) || defaults.hasta;

  const [resumen, categorias, tiendas, heatmapData] = await Promise.all([
    getResumenEmpresa(desde, hasta),
    getDatosCategorias(desde, hasta),
    getDatosTiendas(desde, hasta),
    getHeatmapData(desde, hasta),
  ]);

  const activeCats = categorias.filter((c) => c.ventasReal > 0);
  const totalCatVentas = activeCats.reduce((s, c) => s + c.ventasReal, 0);
  const sortedCats = [...activeCats].sort((a, b) => b.ventasReal - a.ventasReal);

  const catMix = sortedCats.slice(0, 3)
    .map((c) => `${c.nombre} ${((c.ventasReal / totalCatVentas) * 100).toFixed(0)}%`)
    .join(" · ");

  const tiendasFisicas = tiendas.filter((t) => t.tipo === "tienda_fisica");
  const tiendasDigital = tiendas.filter((t) => t.tipo === "ecommerce");
  const ventasFisicas = tiendasFisicas.reduce((s, t) => s + t.ventasReal, 0);
  const ventasDigital = tiendasDigital.reduce((s, t) => s + t.ventasReal, 0);
  const totalCanales = ventasFisicas + ventasDigital;
  const pctFisicas = totalCanales > 0 ? (ventasFisicas / totalCanales) * 100 : 0;
  const pctDigital = totalCanales > 0 ? (ventasDigital / totalCanales) * 100 : 0;

  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))];
  const heatmapCats = [...new Set(heatmapData.map((d) => d.categoria))];
  const tiendaNames: Record<string, string> = {};
  tiendas.forEach((t) => (tiendaNames[t.codigo] = t.nombre));

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <MainKPI
          label="Ventas Acumuladas"
          value={fmtEur(resumen.ventasReal)}
          pctTarget={0}
          previous={resumen.hasAnterior ? fmtEur(resumen.ventasAnterior) : undefined}
          trendPrevious={resumen.hasAnterior ? resumen.pctAnterior : undefined}
        />
        {/* Margen Bruto */}
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-[var(--chs-accent)]" />
            <span className="label-upper">Margen Bruto</span>
          </div>
          <div className="kpi-value text-2xl tabular-nums text-[var(--chs-text-primary)]">
            {fmtEur(resumen.margenReal)}
          </div>
          <div className="text-sm text-[var(--chs-text-muted)] mt-1">
            MB% {pct(resumen.mbPct)}
          </div>
          {resumen.hasAnterior && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--chs-text-muted)]">
              <span>Ant: {fmtEur(resumen.margenAnterior)} ({pct(resumen.mbPctAnterior)})</span>
              <DevPill value={resumen.pctMargenAnterior} />
            </div>
          )}
        </div>
        <KPICard
          label="Mix Categorías"
          value={activeCats.length > 0 ? `${activeCats.length} activas` : "—"}
          sub={catMix}
          icon={<BarChart3 size={16} />}
        />
        {/* Físicas vs Digital */}
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Store size={16} className="text-[var(--chs-accent)]" />
            <span className="label-upper">Físicas vs Digital</span>
          </div>
          <div className="flex h-5 w-full overflow-hidden rounded-full mb-3">
            <div className="h-full transition-all duration-500" style={{ width: `${pctFisicas}%`, backgroundColor: "#2563EB" }} />
            <div className="h-full transition-all duration-500" style={{ width: `${pctDigital}%`, backgroundColor: "#8B5CF6" }} />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#2563EB" }} />
              <span className="text-[var(--chs-text-secondary)]">Físicas {pctFisicas.toFixed(0)}%</span>
              <span className="tabular-nums text-[var(--chs-text-muted)]">{fmtK(ventasFisicas)} €</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#8B5CF6" }} />
              <span className="text-[var(--chs-text-secondary)]">Digital {pctDigital.toFixed(0)}%</span>
              <span className="tabular-nums text-[var(--chs-text-muted)]">{fmtK(ventasDigital)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex items-center justify-center">
          <DonutChart
            segments={activeCats.map((c) => ({ label: c.nombre, value: c.ventasReal, color: c.color }))}
            size={180}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 gap-4 md:grid-cols-3">
          {sortedCats.map((cat) => (
            <CategoryCard
              key={cat.codigo}
              nombre={cat.nombre}
              icono={cat.icono}
              color={cat.color}
              colorLight={cat.colorLight}
              ventasReal={cat.ventasReal}
              totalVentas={totalCatVentas}
              mbPct={cat.mbPct}
            />
          ))}
        </div>
      </div>

      {/* Tabla de tiendas */}
      <StoreTable stores={tiendasFisicas} showMargin />

      {/* Heatmap */}
      {heatmapTiendas.length > 0 && heatmapCats.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--chs-text-primary)]">Heatmap: Tienda x Categoría</h3>
          <Heatmap data={heatmapData} tiendas={heatmapTiendas} categorias={heatmapCats} tiendaNames={tiendaNames} />
        </div>
      )}
    </div>
  );
}
