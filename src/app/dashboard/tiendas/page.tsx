import { getDatosTiendas, getDefaultRange } from "@/lib/queries/ventas";
import { fmtK, pct } from "@/lib/format";
import { StoreMap } from "@/components/charts/store-map";
import { StoreTable } from "@/components/data/store-table";
import { DevPill } from "@/components/data/dev-pill";

export const dynamic = "force-dynamic";

export default async function TiendasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaults = await getDefaultRange();
  const desde = (params.desde as string) || defaults.desde;
  const hasta = (params.hasta as string) || defaults.hasta;

  const tiendas = await getDatosTiendas(desde, hasta);
  const tiendasFisicas = tiendas.filter((t) => t.tipo === "tienda_fisica" && t.ventasReal > 0);
  const hasAnterior = tiendasFisicas.some((t) => t.ventasAnterior > 0);

  const storePoints = tiendasFisicas.map((t) => ({
    codigo: t.codigo,
    nombre: t.nombre,
    lat: t.latitud!,
    lng: t.longitud!,
    ventasReal: t.ventasReal,
    pctObjetivo: 0,
    pctAnterior: t.pctAnterior,
    hasObjetivos: false,
    hasAnterior,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StoreMap stores={storePoints} />
        </div>
        <div className="space-y-3">
          <div className="label-upper">Tiendas Físicas</div>
          {tiendasFisicas.map((t) => (
            <div key={t.codigo} className="rounded-xl border border-[var(--chs-border)] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--chs-text-primary)]">{t.nombre}</span>
                {hasAnterior && t.ventasAnterior > 0 && <DevPill value={t.pctAnterior} />}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[11px] text-[var(--chs-text-muted)]">Real</div>
                  <div className="text-sm font-semibold tabular-nums">{fmtK(t.ventasReal)} €</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--chs-text-muted)]">
                    {hasAnterior && t.ventasAnterior > 0 ? "Año Ant." : "—"}
                  </div>
                  <div className="text-sm tabular-nums text-[var(--chs-text-secondary)]">
                    {hasAnterior && t.ventasAnterior > 0 ? `${fmtK(t.ventasAnterior)} €` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--chs-text-muted)]">MB%</div>
                  <div className="text-sm font-semibold tabular-nums" style={{ color: t.mbPct >= 30 ? "var(--chs-success)" : "var(--chs-warning)" }}>
                    {pct(t.mbPct)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <StoreTable stores={tiendas} title="Todas las Tiendas y Canales" showMargin />
    </div>
  );
}
