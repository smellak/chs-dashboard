import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getHeatmapData, getDefaultPeriod } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { MainKPI } from "@/components/kpi/main-kpi";
import { KPICard } from "@/components/kpi/kpi-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryCard } from "@/components/data/category-card";
import { StoreTable } from "@/components/data/store-table";
import { Heatmap } from "@/components/charts/heatmap";
import { BarChart3, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultPeriod();
  const anio = params.anio ? Number(params.anio) : defaults.anio;
  const mes = params.mes ? Number(params.mes) : defaults.mes;

  const [resumen, categorias, tiendas, heatmapData] = await Promise.all([
    getResumenEmpresa(anio, mes),
    getDatosCategorias(anio, mes),
    getDatosTiendas(anio, mes),
    getHeatmapData(anio, mes),
  ]);

  const tiendasFisicas = tiendas.filter((t) => t.tipo === "tienda_fisica");
  const activeCats = categorias.filter((c) => c.ventasReal > 0);
  const totalCatVentas = activeCats.reduce((s, c) => s + c.ventasReal, 0);

  // Mix Categorías: top 3
  const sortedCats = [...activeCats].sort((a, b) => b.ventasReal - a.ventasReal);
  const catMix = sortedCats
    .slice(0, 3)
    .map((c) => `${c.nombre} ${((c.ventasReal / totalCatVentas) * 100).toFixed(0)}%`)
    .join(" · ");

  // Físicas vs Digital — as proportion of their own sum
  const ventasFisicas = tiendasFisicas.reduce((s, t) => s + t.ventasReal, 0);
  const ventasDigital = tiendas
    .filter((t) => t.tipo === "ecommerce" || t.tipo === "marketplace")
    .reduce((s, t) => s + t.ventasReal, 0);
  const totalCanales = ventasFisicas + ventasDigital;
  const pctFisicas = totalCanales > 0 ? (ventasFisicas / totalCanales) * 100 : 0;
  const pctDigital = totalCanales > 0 ? (ventasDigital / totalCanales) * 100 : 0;

  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))].filter(
    (t) => tiendas.some((s) => s.codigo === t && s.tipo === "tienda_fisica")
  );
  const heatmapCats = [...new Set(heatmapData.map((d) => d.categoria))];
  const tiendaNames: Record<string, string> = {};
  tiendas.forEach((t) => (tiendaNames[t.codigo] = t.nombre));

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <MainKPI
            label="Ventas Acumuladas"
            value={fmtEur(resumen.ventasReal)}
            pctTarget={resumen.pctObjetivo}
            target={resumen.hasObjetivos ? fmtEur(resumen.ventasObjetivo) : undefined}
            previous={resumen.hasAnterior ? fmtEur(resumen.ventasAnterior) : undefined}
            trendTarget={resumen.hasObjetivos ? resumen.pctObjetivo - 100 : undefined}
            trendPrevious={resumen.hasAnterior ? resumen.pctAnterior : undefined}
          />
        </div>
        <KPICard
          label="Mix Categorías"
          value={activeCats.length > 0 ? `${activeCats.length} activas` : "—"}
          sub={catMix}
          icon={<BarChart3 size={16} />}
        />
        {/* Físicas vs Digital — stacked bar */}
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Store size={16} className="text-[var(--chs-accent)]" />
            <span className="label-upper">Físicas vs Digital</span>
          </div>
          <div className="flex h-5 w-full overflow-hidden rounded-full mb-3">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${pctFisicas}%`, backgroundColor: "#2563EB" }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${pctDigital}%`, backgroundColor: "#8B5CF6" }}
            />
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

      {/* Categorías — balanced grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex items-center justify-center">
          <DonutChart
            segments={activeCats.map((c) => ({
              label: c.nombre,
              value: c.ventasReal,
              color: c.color,
            }))}
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
            />
          ))}
        </div>
      </div>

      {/* Tabla de tiendas */}
      <StoreTable stores={tiendasFisicas} />

      {/* Heatmap */}
      {heatmapTiendas.length > 0 && heatmapCats.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--chs-text-primary)]">
            Heatmap: Tienda x Categoría
          </h3>
          <Heatmap
            data={heatmapData}
            tiendas={heatmapTiendas}
            categorias={heatmapCats}
            tiendaNames={tiendaNames}
          />
        </div>
      )}
    </div>
  );
}
