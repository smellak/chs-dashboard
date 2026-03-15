import { getDatosCategorias, getHeatmapData, getDatosTiendas, getDefaultPeriod } from "@/lib/queries/ventas";
import { CategoryCard } from "@/components/data/category-card";
import { Heatmap } from "@/components/charts/heatmap";
import { fmtK } from "@/lib/format";
import { DevPill } from "@/components/data/dev-pill";

export const dynamic = "force-dynamic";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultPeriod();
  const anio = params.anio ? Number(params.anio) : defaults.anio;
  const mes = params.mes ? Number(params.mes) : defaults.mes;

  const [categorias, heatmapData, tiendas] = await Promise.all([
    getDatosCategorias(anio, mes),
    getHeatmapData(anio, mes),
    getDatosTiendas(anio, mes),
  ]);

  const activeCats = categorias.filter((c) => c.ventasReal > 0);
  const totalCatVentas = activeCats.reduce((s, c) => s + c.ventasReal, 0);

  const heatmapTiendas = [...new Set(heatmapData.map((d) => d.tienda))].filter((t) =>
    tiendas.some((s) => s.codigo === t && s.tipo === "tienda_fisica")
  );
  const heatmapCats = [...new Set(heatmapData.map((d) => d.categoria))];
  const tiendaNames: Record<string, string> = {};
  tiendas.forEach((t) => (tiendaNames[t.codigo] = t.nombre));

  return (
    <div className="space-y-6">
      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {activeCats.map((cat) => (
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

      {/* Detail table per category */}
      {activeCats.map((cat) => {
        const catHeatmap = heatmapData.filter((d) => d.categoria === cat.codigo);
        const catHasAnterior = cat.ventasAnterior > 0;
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
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {catHeatmap.map((row) => (
                    <tr key={row.tienda} className="border-t border-[var(--chs-border-light)]">
                      <td className="px-4 py-2.5 font-medium">{tiendaNames[row.tienda] || row.tienda}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmtK(row.ventasReal)} €</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">
                        {cat.ventasReal > 0 ? ((row.ventasReal / cat.ventasReal) * 100).toFixed(1).replace(".", ",") : "0,0"}%
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
