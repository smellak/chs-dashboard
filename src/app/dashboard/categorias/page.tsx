import { getDatosCategorias, getHeatmapData, getDatosTiendas } from "@/lib/queries/ventas";
import { CategoryCard } from "@/components/data/category-card";
import { Heatmap } from "@/components/charts/heatmap";
import { fmtK, pct } from "@/lib/format";
import { DevPill } from "@/components/data/dev-pill";

export const dynamic = "force-dynamic";

const ANIO = 2025;
const MES = 7;

export default async function CategoriasPage() {
  const [categorias, heatmapData, tiendas] = await Promise.all([
    getDatosCategorias(ANIO, MES),
    getHeatmapData(ANIO, MES),
    getDatosTiendas(ANIO, MES),
  ]);

  const tiendasFisicas = ["motril", "juncaril", "almeria", "alban", "antequera"];
  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))].filter((t) =>
    tiendasFisicas.includes(t)
  );
  const heatmapCats = [...new Set(heatmapData.map((d) => d.categoria))];
  const tiendaNames: Record<string, string> = {};
  tiendas.forEach((t) => (tiendaNames[t.codigo] = t.nombre));

  return (
    <div className="space-y-6">
      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {/* Detail table per category */}
      {categorias.map((cat) => {
        const catHeatmap = heatmapData.filter((d) => d.categoria === cat.codigo);
        return (
          <div key={cat.codigo} className="rounded-xl border border-[var(--chs-border)] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--chs-border-light)]">
              <span className="text-lg">{cat.icono}</span>
              <h3 className="text-sm font-semibold text-[var(--chs-text-primary)]">{cat.nombre}</h3>
              <span className="ml-auto text-sm font-semibold tabular-nums" style={{ color: cat.color }}>
                {fmtK(cat.ventasReal)} €
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--chs-bg)]">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Tienda</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Ventas</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Objetivo</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% Obj</th>
                  </tr>
                </thead>
                <tbody>
                  {catHeatmap.map((row) => (
                    <tr key={row.tienda} className="border-t border-[var(--chs-border-light)]">
                      <td className="px-4 py-2.5 font-medium">{tiendaNames[row.tienda] || row.tienda}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmtK(row.ventasReal)} €</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtK(row.ventasObjetivo)} €</td>
                      <td className="px-4 py-2.5 text-center">
                        <DevPill value={row.pctObjetivo - 100} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Heatmap global */}
      {heatmapTiendas.length > 0 && (
        <Heatmap
          data={heatmapData}
          tiendas={heatmapTiendas}
          categorias={heatmapCats}
          tiendaNames={tiendaNames}
        />
      )}
    </div>
  );
}
