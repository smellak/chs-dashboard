interface HeatmapCell {
  tienda: string;
  categoria: string;
  ventasReal: number;
  ventasObjetivo: number;
  pctObjetivo: number;
}

interface HeatmapProps {
  data: HeatmapCell[];
  tiendas: string[];
  categorias: string[];
  tiendaNames: Record<string, string>;
}

function getCellColor(pct: number): string {
  if (pct >= 100) return "var(--chs-success-light)";
  if (pct >= 90) return "#FEF3C7";
  if (pct >= 75) return "#FEF3C7";
  return "var(--chs-error-light)";
}

function getCellTextColor(pct: number): string {
  if (pct >= 100) return "var(--chs-success)";
  if (pct >= 90) return "var(--chs-warning)";
  return "var(--chs-error)";
}

export function Heatmap({ data, tiendas, categorias, tiendaNames }: HeatmapProps) {
  const getCell = (tienda: string, cat: string) =>
    data.find((d) => d.tienda === tienda && d.categoria === cat);

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--chs-border)] bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--chs-bg)]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">
              Tienda
            </th>
            {categorias.map((cat) => (
              <th
                key={cat}
                className="px-4 py-3 text-center text-xs font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider"
              >
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
                const pct = cell?.pctObjetivo || 0;
                return (
                  <td key={cat} className="px-4 py-3 text-center">
                    <span
                      className="inline-block rounded-md px-3 py-1.5 text-xs font-semibold tabular-nums"
                      style={{
                        backgroundColor: getCellColor(pct),
                        color: getCellTextColor(pct),
                      }}
                    >
                      {pct.toFixed(0)}%
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
