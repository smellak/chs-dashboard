import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getHeatmapData } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct } from "@/lib/format";
import { MainKPI } from "@/components/kpi/main-kpi";
import { KPICard } from "@/components/kpi/kpi-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { CategoryCard } from "@/components/data/category-card";
import { StoreTable } from "@/components/data/store-table";
import { Heatmap } from "@/components/charts/heatmap";
import { Euro, TrendingUp, Target, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const ANIO = 2025;
const MES = 7;

export default async function DashboardPage() {
  const [resumen, categorias, tiendas, heatmapData] = await Promise.all([
    getResumenEmpresa(ANIO, MES),
    getDatosCategorias(ANIO, MES),
    getDatosTiendas(ANIO, MES),
    getHeatmapData(ANIO, MES),
  ]);

  const tiendasFisicas = tiendas.filter((t) =>
    ["motril", "juncaril", "almeria", "alban", "antequera"].includes(t.codigo)
  );

  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))].filter(
    (t) => ["motril", "juncaril", "almeria", "alban", "antequera"].includes(t)
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
            target={fmtEur(resumen.ventasObjetivo)}
            previous={fmtEur(resumen.ventasAnterior)}
            trendTarget={resumen.pctObjetivo - 100}
            trendPrevious={resumen.pctAnterior}
          />
        </div>
        <KPICard
          label="Margen Bruto"
          value={fmtEur(resumen.margenReal)}
          sub={`Obj: ${fmtK(resumen.margenObjetivo)} €`}
          trend={resumen.margenObjetivo > 0 ? ((resumen.margenReal / resumen.margenObjetivo) * 100) - 100 : 0}
          icon={<Euro size={16} />}
        />
        <KPICard
          label="MB %"
          value={pct(resumen.mbPct)}
          sub="sobre ventas"
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label="vs Objetivo"
          value={pct(resumen.pctObjetivo)}
          sub={fmtK(resumen.ventasObjetivo) + " € obj."}
          trend={resumen.pctObjetivo - 100}
          icon={<Target size={16} />}
        />
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex items-center justify-center">
          <DonutChart
            segments={categorias.map((c) => ({
              label: c.nombre,
              value: c.ventasReal,
              color: c.color,
            }))}
            size={180}
          />
        </div>
        {categorias.map((cat) => (
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
