import { getDatosTiendas, getDefaultPeriod } from "@/lib/queries/ventas";
import { fmtK } from "@/lib/format";
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
  const defaults = await getDefaultPeriod();
  const anio = params.anio ? Number(params.anio) : defaults.anio;
  const mes = params.mes ? Number(params.mes) : defaults.mes;

  const tiendas = await getDatosTiendas(anio, mes);
  const tiendasFisicas = tiendas.filter((t) => t.tipo === "tienda_fisica");
  const hasObjetivos = tiendasFisicas.some((t) => t.ventasObjetivo > 0);
  const hasAnterior = tiendasFisicas.some((t) => t.ventasAnterior > 0);

  const storePoints = tiendasFisicas.map((t) => ({
    codigo: t.codigo,
    nombre: t.nombre,
    lat: t.latitud!,
    lng: t.longitud!,
    ventasReal: t.ventasReal,
    pctObjetivo: t.pctObjetivo,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <StoreMap stores={storePoints} />
        </div>

        {/* Store cards */}
        <div className="space-y-3">
          <div className="label-upper">Tiendas Físicas</div>
          {tiendasFisicas.map((t) => (
            <div
              key={t.codigo}
              className="rounded-xl border border-[var(--chs-border)] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--chs-text-primary)]">
                  {t.nombre}
                </span>
                {hasObjetivos && t.ventasObjetivo > 0 && <DevPill value={t.pctObjetivo - 100} />}
                {!hasObjetivos && hasAnterior && t.ventasAnterior > 0 && <DevPill value={t.pctAnterior} />}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[11px] text-[var(--chs-text-muted)]">Real</div>
                  <div className="text-sm font-semibold tabular-nums">{fmtK(t.ventasReal)} €</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--chs-text-muted)]">
                    {hasObjetivos && t.ventasObjetivo > 0 ? "Objetivo" : hasAnterior && t.ventasAnterior > 0 ? "Año Ant." : "—"}
                  </div>
                  <div className="text-sm tabular-nums text-[var(--chs-text-secondary)]">
                    {hasObjetivos && t.ventasObjetivo > 0
                      ? `${fmtK(t.ventasObjetivo)} €`
                      : hasAnterior && t.ventasAnterior > 0
                      ? `${fmtK(t.ventasAnterior)} €`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full table */}
      <StoreTable stores={tiendas} title="Todas las Tiendas y Canales" />
    </div>
  );
}
