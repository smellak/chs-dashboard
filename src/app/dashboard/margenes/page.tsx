import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getDefaultRange } from "@/lib/queries/ventas";
import { fmtK, fmtEur, pct, fmtNum } from "@/lib/format";
import { DevPill } from "@/components/data/dev-pill";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MargenesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultRange();
  const desde = (params.desde as string) || defaults.desde;
  const hasta = (params.hasta as string) || defaults.hasta;

  const [resumen, categorias, tiendas] = await Promise.all([
    getResumenEmpresa(desde, hasta),
    getDatosCategorias(desde, hasta),
    getDatosTiendas(desde, hasta),
  ]);

  const activeCats = categorias.filter((c) => c.ventasReal > 0);
  const activeTiendas = tiendas.filter((t) => t.ventasReal > 0);
  const hasAnterior = resumen.hasAnterior;

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-[var(--chs-accent)]" />
            <span className="label-upper">Margen Bruto Empresa</span>
          </div>
          <div className="kpi-value text-3xl tabular-nums text-[var(--chs-text-primary)]">{fmtEur(resumen.margenReal)}</div>
          <div className="text-lg font-semibold mt-1" style={{ color: resumen.mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
            MB% {pct(resumen.mbPct)}
          </div>
          {hasAnterior && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--chs-text-muted)]">
              <span>Ant: {fmtEur(resumen.margenAnterior)} ({pct(resumen.mbPctAnterior)})</span>
              <DevPill value={resumen.pctMargenAnterior} />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <span className="label-upper">Ventas Totales</span>
          <div className="kpi-value text-2xl tabular-nums text-[var(--chs-text-primary)] mt-2">{fmtEur(resumen.ventasReal)}</div>
          {hasAnterior && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--chs-text-muted)]">
              <span>Ant: {fmtEur(resumen.ventasAnterior)}</span>
              <DevPill value={resumen.pctAnterior} />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <span className="label-upper">Coste de Ventas</span>
          <div className="kpi-value text-2xl tabular-nums text-[var(--chs-text-primary)] mt-2">{fmtEur(resumen.costeReal)}</div>
          {hasAnterior && (
            <div className="text-xs text-[var(--chs-text-muted)] mt-2">Ant: {fmtEur(resumen.costeAnterior)}</div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm">
          <span className="label-upper">MB% vs Anterior</span>
          {hasAnterior ? (
            <>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-bold tabular-nums" style={{ color: resumen.mbPct >= resumen.mbPctAnterior ? "var(--chs-success)" : "var(--chs-error)" }}>
                  {pct(resumen.mbPct)}
                </span>
                <span className="text-sm text-[var(--chs-text-muted)]">vs {pct(resumen.mbPctAnterior)}</span>
              </div>
              <div className="text-xs text-[var(--chs-text-muted)] mt-1">
                {(resumen.mbPct - resumen.mbPctAnterior) >= 0 ? "+" : ""}{(resumen.mbPct - resumen.mbPctAnterior).toFixed(1).replace(".", ",")} pp
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold tabular-nums mt-2">{pct(resumen.mbPct)}</div>
          )}
        </div>
      </div>

      {/* Margin by category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--chs-text-primary)]">Margen por Categoría</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {activeCats.sort((a, b) => b.mbPct - a.mbPct).map((cat) => (
            <div key={cat.codigo} className="rounded-xl border border-[var(--chs-border)] bg-white p-4 shadow-sm text-center">
              <span className="text-2xl">{cat.icono}</span>
              <div className="text-xs font-medium text-[var(--chs-text-secondary)] mt-1">{cat.nombre}</div>
              <div className="text-2xl font-bold tabular-nums mt-2" style={{ color: cat.mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
                {pct(cat.mbPct)}
              </div>
              <div className="text-xs text-[var(--chs-text-muted)] mt-1">
                Margen: {fmtK(cat.margenReal)} €
              </div>
              <div className="text-xs text-[var(--chs-text-muted)]">
                Ventas: {fmtK(cat.ventasReal)} €
              </div>
              {cat.ventasAnterior > 0 && (
                <div className="text-xs text-[var(--chs-text-muted)] mt-1">
                  Ant MB%: {pct(cat.mbPctAnterior)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full margin table */}
      <div className="rounded-xl border border-[var(--chs-border)] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--chs-border-light)]">
          <h3 className="text-sm font-semibold text-[var(--chs-text-primary)]">Detalle por Tienda/Canal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--chs-bg)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Tienda</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Ventas</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Coste</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Margen</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">MB%</th>
                {hasAnterior && (
                  <>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Ventas Ant.</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">MB% Ant.</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% YoY</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTiendas.map((t) => (
                <tr key={t.codigo} className="border-t border-[var(--chs-border-light)] hover:bg-[var(--chs-bg)] transition-colors">
                  <td className="px-4 py-2.5 font-medium text-[var(--chs-text-primary)]">{t.nombre}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(t.ventasReal)} €</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(t.costeReal)} €</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(t.margenReal)} €</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold" style={{ color: t.mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
                    {pct(t.mbPct)}
                  </td>
                  {hasAnterior && (
                    <>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">
                        {t.ventasAnterior > 0 ? `${fmtNum(t.ventasAnterior)} €` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">
                        {t.ventasAnterior > 0 ? pct(t.mbPctAnterior) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {t.ventasAnterior > 0 ? <DevPill value={t.pctAnterior} /> : <span className="text-[var(--chs-text-muted)]">—</span>}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--chs-border)] bg-[var(--chs-bg)] font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtNum(resumen.ventasReal)} €</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(resumen.costeReal)} €</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtNum(resumen.margenReal)} €</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: resumen.mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
                  {pct(resumen.mbPct)}
                </td>
                {hasAnterior && (
                  <>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtNum(resumen.ventasAnterior)} €</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{pct(resumen.mbPctAnterior)}</td>
                    <td className="px-4 py-3 text-center"><DevPill value={resumen.pctAnterior} /></td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[var(--chs-border-light)]">
          <p className="text-[11px] text-[var(--chs-text-muted)] italic">
            Margen Bruto antes de comisiones, logística y financieros
          </p>
        </div>
      </div>
    </div>
  );
}
