import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getHeatmapData, getLatestPeriod } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { MainKPI } from "@/components/kpi/main-kpi";
import { KPICard } from "@/components/kpi/kpi-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryCard } from "@/components/data/category-card";
import { StoreTable } from "@/components/data/store-table";
import { Heatmap } from "@/components/charts/heatmap";
import { Euro, TrendingUp, Target, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { anio, mes } = await getLatestPeriod();

  const [resumen, categorias, tiendas, heatmapData] = await Promise.all([
    getResumenEmpresa(anio, mes),
    getDatosCategorias(anio, mes),
    getDatosTiendas(anio, mes),
    getHeatmapData(anio, mes),
  ]);

  const tiendasFisicas = tiendas.filter((t) => t.tipo === "tienda_fisica");

  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))].filter(
    (t) => tiendas.some((s) => s.codigo === t && s.tipo === "tienda_fisica")
  );
  const heatmapCats = [...new Set(heatmapData.map((d) => d.categoria))];
  const tiendaNames: Record<string, string> = {};
  tiendas.forEach((t) => (tiendaNames[t.codigo] = t.nombre));

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <MainKPI
            label="Ventas Acumuladas"
            value={fmtEur(resumen.ventasReal)}
            pctTarget={resumen.pctObjetivo}
            target={resumen.ventasObjetivo > 0 ? fmtEur(resumen.ventasObjetivo) : undefined}
            previous={fmtEur(resumen.ventasAnterior)}
            trendTarget={resumen.ventasObjetivo > 0 ? resumen.pctObjetivo - 100 : undefined}
            trendPrevious={resumen.pctAnterior}
          />
        </div>
        <KPICard
          label="Margen Bruto"
          value={fmtEur(resumen.margenReal)}
          sub={resumen.margenObjetivo > 0 ? `Obj: ${fmtK(resumen.margenObjetivo)} €` : "Sin objetivo"}
          trend={resumen.margenObjetivo > 0 ? ((resumen.margenReal / resumen.margenObjetivo) * 100) - 100 : undefined}
          icon={<Euro size={16} />}
        />
        <KPICard
          label="MB %"
          value={pct(resumen.mbPct)}
          sub="sobre ventas"
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label={resumen.ventasObjetivo > 0 ? "vs Objetivo" : "vs Año Anterior"}
          value={resumen.ventasObjetivo > 0 ? pct(resumen.pctObjetivo) : fmtEur(resumen.ventasReal - resumen.ventasAnterior)}
          sub={resumen.ventasObjetivo > 0 ? `${fmtK(resumen.ventasObjetivo)} € obj.` : `${fmtK(resumen.ventasAnterior)} € en ${anio - 1}`}
          trend={resumen.ventasObjetivo > 0 ? resumen.pctObjetivo - 100 : resumen.pctAnterior}
          icon={<Target size={16} />}
        />
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex items-center justify-center">
          <DonutChart
            segments={categorias
              .filter((c) => c.ventasReal > 0)
              .map((c) => ({
                label: c.nombre,
                value: c.ventasReal,
                color: c.color,
              }))}
            size={180}
          />
        </div>
        {categorias.filter((c) => c.ventasReal !== 0).map((cat) => (
          <CategoryCard
            key={cat.codigo}
            nombre={cat.nombre}
            icono={cat.icono}
            color={cat.color}
            colorLight={cat.colorLight}
            ventasReal={cat.ventasReal}
            ventasObjetivo={cat.ventasObjetivo}
            pctObjetivo={cat.pctObjetivo}
            mbPct={cat.mbPct}
          />
        ))}
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
