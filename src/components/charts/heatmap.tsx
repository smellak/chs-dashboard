interface HeatmapCell {
  tienda: string;
  categoria: string;
  ventasReal: number;
  margenReal?: number;
  mbPct?: number;
  ventasObjetivo?: number;
  pctObjetivo?: number;
}

interface HeatmapProps {
  data: HeatmapCell[];
  tiendas: string[];
  categorias: string[];
  tiendaNames: Record<string, string>;
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);
}

export function Heatmap({ data, tiendas, categorias, tiendaNames }: HeatmapProps) {
  const getCell = (tienda: string, cat: string) =>
    data.find((d) => d.tienda === tienda && d.categoria === cat);

  const maxVentas = Math.max(...data.map((d) => d.ventasReal), 1);

  function getCellBg(cell: HeatmapCell | undefined): string {
    if (!cell || cell.ventasReal < 1) return "var(--chs-bg)";
    const intensity = cell.ventasReal / maxVentas;
    if (intensity > 0.5) return "var(--chs-success-light)";
    if (intensity > 0.2) return "var(--chs-accent-light)";
    return "#F1F5F9";
  }

  function getCellFg(cell: HeatmapCell | undefined): string {
    if (!cell || cell.ventasReal < 1) return "var(--chs-text-muted)";
    const intensity = cell.ventasReal / maxVentas;
    if (intensity > 0.5) return "var(--chs-success)";
    if (intensity > 0.2) return "var(--chs-accent)";
    return "var(--chs-text-muted)";
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--chs-border)] bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--chs-bg)]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Tienda</th>
            {categorias.map((cat) => (
              <th key={cat} className="px-4 py-3 text-center text-xs font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">
                {cat}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tiendas.map((tienda) => (
            <tr key={tienda} className="border-t border-[var(--chs-border-light)]">
              <td className="px-4 py-3 font-medium text-[var(--chs-text-primary)]">
                {tiendaNames[tienda] || tienda}
              </td>
              {categorias.map((cat) => {
                const cell = getCell(tienda, cat);
                return (
                  <td key={cat} className="px-4 py-3 text-center">
                    <span
                      className="inline-block rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums"
                      style={{ backgroundColor: getCellBg(cell), color: getCellFg(cell) }}
                    >
                      {cell && cell.ventasReal >= 1
                        ? `${fmtK(cell.ventasReal)} €`
                        : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
