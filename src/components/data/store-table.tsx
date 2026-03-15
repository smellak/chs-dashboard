import { DevPill } from "@/components/data/dev-pill";

interface StoreRow {
  nombre: string;
  ventasReal: number;
  ventasObjetivo: number;
  ventasAnterior: number;
  margenReal: number;
  mbPct: number;
  pctObjetivo: number;
  pctAnterior: number;
}

interface StoreTableProps {
  stores: StoreRow[];
  title?: string;
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);
}

export function StoreTable({ stores, title = "Rendimiento por Tienda" }: StoreTableProps) {
  // Filter out stores with 0 or negative sales
  const activeStores = stores.filter((s) => s.ventasReal > 0);

  const totalReal = activeStores.reduce((s, r) => s + r.ventasReal, 0);
  const totalObj = activeStores.reduce((s, r) => s + r.ventasObjetivo, 0);
  const totalAnt = activeStores.reduce((s, r) => s + r.ventasAnterior, 0);

  const hasObjetivos = totalObj > 0;
  const hasAnterior = totalAnt > 0;

  if (activeStores.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--chs-border)] bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--chs-border-light)]">
        <h3 className="text-sm font-semibold text-[var(--chs-text-primary)]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--chs-bg)]">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Tienda</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Real</th>
              {!hasObjetivos && !hasAnterior && (
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% del Total</th>
              )}
              {hasObjetivos && (
                <>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Objetivo</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% Obj</th>
                </>
              )}
              {hasAnterior && (
                <>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Año Ant.</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% YoY</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {activeStores.map((store) => (
              <tr key={store.nombre} className="border-t border-[var(--chs-border-light)] hover:bg-[var(--chs-bg)] transition-colors">
                <td className="px-4 py-2.5 font-medium text-[var(--chs-text-primary)]">{store.nombre}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(store.ventasReal)} €</td>
                {!hasObjetivos && !hasAnterior && (
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">
                    {totalReal > 0 ? ((store.ventasReal / totalReal) * 100).toFixed(1).replace(".", ",") : "0,0"}%
                  </td>
                )}
                {hasObjetivos && (
                  <>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(store.ventasObjetivo)} €</td>
                    <td className="px-4 py-2.5 text-center"><DevPill value={store.pctObjetivo - 100} /></td>
                  </>
                )}
                {hasAnterior && store.ventasAnterior > 0 ? (
                  <>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(store.ventasAnterior)} €</td>
                    <td className="px-4 py-2.5 text-center"><DevPill value={store.pctAnterior} /></td>
                  </>
                ) : hasAnterior ? (
                  <>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">—</td>
                    <td className="px-4 py-2.5 text-center text-[var(--chs-text-muted)]">—</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--chs-border)] bg-[var(--chs-bg)] font-semibold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtNum(totalReal)} €</td>
              {!hasObjetivos && !hasAnterior && (
                <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">100%</td>
              )}
              {hasObjetivos && (
                <>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(totalObj)} €</td>
                  <td className="px-4 py-3 text-center">
                    <DevPill value={totalObj > 0 ? ((totalReal / totalObj) * 100) - 100 : 0} />
                  </td>
                </>
              )}
              {hasAnterior && (
                <>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(totalAnt)} €</td>
                  <td className="px-4 py-3 text-center">
                    <DevPill value={totalAnt > 0 ? ((totalReal - totalAnt) / totalAnt) * 100 : 0} />
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
