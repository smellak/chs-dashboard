import { getResumenEmpresa, getDatosCategorias, getDatosTiendas } from "@/lib/queries/ventas";
import { fmtEur, fmtK, pct } from "@/lib/format";
import { KPICard } from "@/components/kpi/kpi-card";
import { DevPill } from "@/components/data/dev-pill";
import { ProgressBar } from "@/components/charts/progress-bar";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const ANIO = 2025;
const MES = 7;

export default async function MargenesPage() {
  const [resumen, categorias, tiendas] = await Promise.all([
    getResumenEmpresa(ANIO, MES),
    getDatosCategorias(ANIO, MES),
    getDatosTiendas(ANIO, MES),
  ]);

  return (
    <div className="space-y-6">
      {/* Company margin KPI */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard
          label="Margen Bruto Total"
          value={fmtEur(resumen.margenReal)}
          sub={`Obj: ${fmtK(resumen.margenObjetivo)} €`}
          trend={resumen.margenObjetivo > 0 ? ((resumen.margenReal / resumen.margenObjetivo) * 100) - 100 : 0}
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label="MB % Empresa"
          value={pct(resumen.mbPct)}
          sub="sobre ventas totales"
        />
        <KPICard
          label="vs Año Anterior"
          value={fmtEur(resumen.margenReal - resumen.margenAnterior)}
          trend={resumen.margenAnterior > 0 ? ((resumen.margenReal - resumen.margenAnterior) / resumen.margenAnterior) * 100 : 0}
          sub={`${fmtK(resumen.margenAnterior)} € en ${ANIO - 1}`}
        />
      </div>

      {/* Margin by category */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {categorias.map((cat) => (
          <div
            key={cat.codigo}
            className="rounded-xl border border-[var(--chs-border)] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{cat.icono}</span>
              <span className="text-sm font-semibold text-[var(--chs-text-primary)]">
                {cat.nombre}
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="kpi-value text-4xl tabular-nums" style={{ color: cat.color }}>
                {pct(cat.mbPct)}
              </div>
              <div className="text-xs text-[var(--chs-text-muted)] mt-1">Margen Bruto</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--chs-text-muted)]">Margen</span>
                <span className="tabular-nums font-medium">{fmtK(cat.margenReal)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--chs-text-muted)]">Objetivo</span>
                <span className="tabular-nums">{fmtK(cat.margenObjetivo)} €</span>
              </div>
              <ProgressBar
                value={cat.margenReal}
                max={cat.margenObjetivo}
                color={cat.color}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Margin by store table */}
      <div className="rounded-xl border border-[var(--chs-border)] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--chs-border-light)]">
          <h3 className="text-sm font-semibold text-[var(--chs-text-primary)]">
            Margen por Tienda / Canal
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--chs-bg)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Tienda</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Ventas</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Margen</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">MB%</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">Obj. Margen</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-[var(--chs-text-muted)] uppercase tracking-wider">% Obj</th>
              </tr>
            </thead>
            <tbody>
              {tiendas.map((t) => (
                <tr key={t.codigo} className="border-t border-[var(--chs-border-light)] hover:bg-[var(--chs-bg)] transition-colors">
                  <td className="px-4 py-2.5 font-medium">{t.nombre}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmtK(t.ventasReal)} €</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmtK(t.margenReal)} €</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{pct(t.mbPct)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtK(t.margenObjetivo)} €</td>
                  <td className="px-4 py-2.5 text-center">
                    <DevPill value={t.margenObjetivo > 0 ? ((t.margenReal / t.margenObjetivo) * 100) - 100 : 0} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--chs-border)] bg-[var(--chs-bg)] font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtK(resumen.ventasReal)} €</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtK(resumen.margenReal)} €</td>
                <td className="px-4 py-3 text-right tabular-nums">{pct(resumen.mbPct)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--chs-text-muted)]">{fmtK(resumen.margenObjetivo)} €</td>
                <td className="px-4 py-3 text-center">
                  <DevPill value={resumen.margenObjetivo > 0 ? ((resumen.margenReal / resumen.margenObjetivo) * 100) - 100 : 0} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
