import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// ============================================================
// TYPES
// ============================================================

export interface DateRange {
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  label: string;
}

export interface ResumenEmpresa {
  ventasReal: number;
  costeReal: number;
  margenReal: number;
  mbPct: number;
  ventasAnterior: number;
  costeAnterior: number;
  margenAnterior: number;
  mbPctAnterior: number;
  pctAnterior: number;       // ventas YoY %
  pctMargenAnterior: number; // margin YoY %
  hasAnterior: boolean;
  numLineas: number;
  numTickets: number;
}

export interface DatosTienda {
  codigo: string;
  nombre: string;
  tipo: string;
  latitud: number | null;
  longitud: number | null;
  ventasReal: number;
  costeReal: number;
  margenReal: number;
  mbPct: number;
  ventasAnterior: number;
  margenAnterior: number;
  mbPctAnterior: number;
  pctAnterior: number;
  numLineas: number;
}

export interface DatosCategoria {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  colorLight: string;
  ventasReal: number;
  costeReal: number;
  margenReal: number;
  mbPct: number;
  ventasAnterior: number;
  margenAnterior: number;
  mbPctAnterior: number;
  pctAnterior: number;
}

export interface DatosCanal {
  codigo: string;
  nombre: string;
  ventasReal: number;
  costeReal: number;
  margenReal: number;
  mbPct: number;
  ventasAnterior: number;
  margenAnterior: number;
  pctAnterior: number;
}

export interface HeatmapCell {
  tienda: string;
  categoria: string;
  ventasReal: number;
  margenReal: number;
  mbPct: number;
}

// ============================================================
// TIENDA CLASSIFICATION
// ============================================================

const TIENDAS_FISICAS = ["motril", "juncaril", "alban", "almeria", "antequera"];
const CANALES_DIGITALES = ["chs_web", "shiito_es", "amazon", "kibuc", "leroy_merlin", "media_markt", "carrefour", "worten"];
const TIENDAS_EXCLUIR = ["servicios_centrales", "contract"];

const TIENDA_NOMBRES: Record<string, string> = {
  motril: "Motril",
  juncaril: "Juncaril",
  alban: "Albán",
  almeria: "Almería",
  antequera: "Antequera",
  chs_web: "CHS Web",
  shiito_es: "Shiito",
  amazon: "Amazon",
  kibuc: "Kibuc Granada",
  leroy_merlin: "Leroy Merlin",
  media_markt: "Media Markt",
  carrefour: "Carrefour",
  worten: "Worten",
  contract: "Contract",
  servicios_centrales: "Servicios Centrales",
};

const TIENDA_COORDS: Record<string, { lat: number; lng: number }> = {
  motril: { lat: 36.7453, lng: -3.5186 },
  juncaril: { lat: 37.2183, lng: -3.6328 },
  alban: { lat: 37.1925, lng: -3.5881 },
  almeria: { lat: 36.8402, lng: -2.4675 },
  antequera: { lat: 37.0194, lng: -4.5618 },
};

function tiendaTipo(codigo: string): string {
  if (TIENDAS_FISICAS.includes(codigo)) return "tienda_fisica";
  if (CANALES_DIGITALES.includes(codigo)) return "ecommerce";
  return "otro";
}

// ============================================================
// DATE RANGE HELPERS
// ============================================================

/** Calculate the previous-year equivalent of a date range */
export function getRangoAnterior(desde: string, hasta: string): { desde: string; hasta: string } {
  const d = new Date(desde);
  const h = new Date(hasta);
  d.setFullYear(d.getFullYear() - 1);
  h.setFullYear(h.getFullYear() - 1);
  return {
    desde: d.toISOString().split("T")[0],
    hasta: h.toISOString().split("T")[0],
  };
}

/** Get the default date range: last complete month */
export async function getDefaultRange(): Promise<DateRange> {
  // Get max date from data
  const [row] = await db.execute<{ max_fecha: string }>(sql`
    SELECT MAX(fecha)::text as max_fecha FROM direccion.cuadro_mando
  `);
  const maxDate = row?.max_fecha ? new Date(row.max_fecha) : new Date();

  // Last complete month
  const year = maxDate.getMonth() === 0 ? maxDate.getFullYear() - 1 : maxDate.getFullYear();
  const month = maxDate.getMonth() === 0 ? 12 : maxDate.getMonth(); // getMonth() is 0-indexed
  const desde = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const hasta = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return { desde, hasta, label: `${MESES[month - 1]} ${year}` };
}

/** Get available predefined ranges */
export function getPredefinedRanges(): { key: string; label: string; desde: string; hasta: string }[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  // MTD
  const mtdDesde = `${y}-${String(m + 1).padStart(2, "0")}-01`;

  // Mes anterior
  const prevM = m === 0 ? 12 : m;
  const prevY = m === 0 ? y - 1 : y;
  const prevDesde = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const prevLastDay = new Date(prevY, prevM, 0).getDate();
  const prevHasta = `${prevY}-${String(prevM).padStart(2, "0")}-${String(prevLastDay).padStart(2, "0")}`;

  // Últimos 30 días
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d30Str = d30.toISOString().split("T")[0];

  // Últimos 90 días
  const d90 = new Date(now);
  d90.setDate(d90.getDate() - 90);
  const d90Str = d90.toISOString().split("T")[0];

  // YTD
  const ytdDesde = `${y}-01-01`;

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  return [
    { key: "mes_anterior", label: `${MESES[prevM - 1]} ${prevY}`, desde: prevDesde, hasta: prevHasta },
    { key: "mtd", label: "Mes actual (MTD)", desde: mtdDesde, hasta: today },
    { key: "30d", label: "Últimos 30 días", desde: d30Str, hasta: today },
    { key: "90d", label: "Últimos 90 días", desde: d90Str, hasta: today },
    { key: "ytd", label: `Año ${y} (YTD)`, desde: ytdDesde, hasta: today },
  ];
}

/** Check if we have data for the anterior range */
async function checkAnteriorData(desde: string, hasta: string): Promise<boolean> {
  const ant = getRangoAnterior(desde, hasta);
  const [row] = await db.execute<{ cnt: string }>(sql`
    SELECT COUNT(*)::text as cnt FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${ant.desde} AND ${ant.hasta}
    LIMIT 1
  `);
  return Number(row?.cnt || 0) > 0;
}

// ============================================================
// MAIN QUERIES — ALL FROM direccion.cuadro_mando
// ============================================================

export async function getResumenEmpresa(desde: string, hasta: string): Promise<ResumenEmpresa> {
  const ant = getRangoAnterior(desde, hasta);

  const [real] = await db.execute<{
    ventas: string; coste: string; margen: string; num_lineas: string; num_tickets: string;
  }>(sql`
    SELECT
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(coste), 0)::text as coste,
      COALESCE(SUM(margen), 0)::text as margen,
      COALESCE(SUM(num_lineas), 0)::text as num_lineas,
      COALESCE(SUM(num_tickets), 0)::text as num_tickets
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria != 'anticipos'
  `);

  const [anterior] = await db.execute<{
    ventas: string; coste: string; margen: string;
  }>(sql`
    SELECT
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(coste), 0)::text as coste,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${ant.desde} AND ${ant.hasta}
      AND categoria != 'anticipos'
  `);

  const ventasReal = Number(real?.ventas || 0);
  const costeReal = Number(real?.coste || 0);
  const margenReal = Number(real?.margen || 0);
  const ventasAnterior = Number(anterior?.ventas || 0);
  const costeAnterior = Number(anterior?.coste || 0);
  const margenAnterior = Number(anterior?.margen || 0);
  const hasAnterior = ventasAnterior > 0;

  return {
    ventasReal,
    costeReal,
    margenReal,
    mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
    ventasAnterior,
    costeAnterior,
    margenAnterior,
    mbPctAnterior: ventasAnterior > 0 ? (margenAnterior / ventasAnterior) * 100 : 0,
    pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
    pctMargenAnterior: margenAnterior > 0 ? ((margenReal - margenAnterior) / margenAnterior) * 100 : 0,
    hasAnterior,
    numLineas: Number(real?.num_lineas || 0),
    numTickets: Number(real?.num_tickets || 0),
  };
}

export async function getDatosTiendas(desde: string, hasta: string): Promise<DatosTienda[]> {
  const ant = getRangoAnterior(desde, hasta);

  const rows = await db.execute<{
    tienda: string; ventas: string; coste: string; margen: string; num_lineas: string;
  }>(sql`
    SELECT
      tienda,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(coste), 0)::text as coste,
      COALESCE(SUM(margen), 0)::text as margen,
      COALESCE(SUM(num_lineas), 0)::text as num_lineas
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria != 'anticipos'
    GROUP BY tienda
    ORDER BY SUM(venta) DESC
  `);

  const antRows = await db.execute<{
    tienda: string; ventas: string; margen: string;
  }>(sql`
    SELECT
      tienda,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${ant.desde} AND ${ant.hasta}
      AND categoria != 'anticipos'
    GROUP BY tienda
  `);

  const antMap = new Map(antRows.map(r => [r.tienda, { ventas: Number(r.ventas), margen: Number(r.margen) }]));

  return rows.map((r) => {
    const ventasReal = Number(r.ventas);
    const costeReal = Number(r.coste);
    const margenReal = Number(r.margen);
    const antData = antMap.get(r.tienda);
    const ventasAnterior = antData?.ventas || 0;
    const margenAnterior = antData?.margen || 0;
    const coords = TIENDA_COORDS[r.tienda];

    return {
      codigo: r.tienda,
      nombre: TIENDA_NOMBRES[r.tienda] || r.tienda,
      tipo: tiendaTipo(r.tienda),
      latitud: coords?.lat ?? null,
      longitud: coords?.lng ?? null,
      ventasReal,
      costeReal,
      margenReal,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      ventasAnterior,
      margenAnterior,
      mbPctAnterior: ventasAnterior > 0 ? (margenAnterior / ventasAnterior) * 100 : 0,
      pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
      numLineas: Number(r.num_lineas),
    };
  });
}

export async function getDatosCategorias(desde: string, hasta: string): Promise<DatosCategoria[]> {
  const ant = getRangoAnterior(desde, hasta);

  const CAT_META: Record<string, { nombre: string; icono: string; color: string; colorLight: string }> = {
    muebles:   { nombre: "Muebles",           icono: "🛋️", color: "#2563EB", colorLight: "#EFF6FF" },
    electro:   { nombre: "Electrodomésticos", icono: "⚡",  color: "#7C3AED", colorLight: "#F5F3FF" },
    cocinas:   { nombre: "Cocinas y Baño",    icono: "🔍",  color: "#0891B2", colorLight: "#ECFEFF" },
    servicios: { nombre: "Servicios",          icono: "🔧",  color: "#16A34A", colorLight: "#DCFCE7" },
    otros:     { nombre: "Otros",              icono: "📦",  color: "#F59E0B", colorLight: "#FEF3C7" },
    reformas:  { nombre: "Reformas",           icono: "🏗️", color: "#DC2626", colorLight: "#FEE2E2" },
  };

  const rows = await db.execute<{
    categoria: string; ventas: string; coste: string; margen: string;
  }>(sql`
    SELECT
      categoria,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(coste), 0)::text as coste,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria != 'anticipos'
    GROUP BY categoria
    ORDER BY SUM(venta) DESC
  `);

  const antRows = await db.execute<{
    categoria: string; ventas: string; margen: string;
  }>(sql`
    SELECT
      categoria,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${ant.desde} AND ${ant.hasta}
      AND categoria != 'anticipos'
    GROUP BY categoria
  `);

  const antMap = new Map(antRows.map(r => [r.categoria, { ventas: Number(r.ventas), margen: Number(r.margen) }]));

  return rows.map((r) => {
    const meta = CAT_META[r.categoria] || { nombre: r.categoria, icono: "📁", color: "#94A3B8", colorLight: "#F1F5F9" };
    const ventasReal = Number(r.ventas);
    const costeReal = Number(r.coste);
    const margenReal = Number(r.margen);
    const antData = antMap.get(r.categoria);
    const ventasAnterior = antData?.ventas || 0;
    const margenAnterior = antData?.margen || 0;

    return {
      codigo: r.categoria,
      nombre: meta.nombre,
      icono: meta.icono,
      color: meta.color,
      colorLight: meta.colorLight,
      ventasReal,
      costeReal,
      margenReal,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      ventasAnterior,
      margenAnterior,
      mbPctAnterior: ventasAnterior > 0 ? (margenAnterior / ventasAnterior) * 100 : 0,
      pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
    };
  });
}

export async function getDatosCanales(desde: string, hasta: string): Promise<DatosCanal[]> {
  const ant = getRangoAnterior(desde, hasta);
  const digitales = CANALES_DIGITALES;

  const rows = await db.execute<{
    tienda: string; ventas: string; coste: string; margen: string;
  }>(sql`
    SELECT
      tienda,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(coste), 0)::text as coste,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria != 'anticipos'
      AND tienda IN (${sql.join(digitales.map(d => sql`${d}`), sql`, `)})
    GROUP BY tienda
    ORDER BY SUM(venta) DESC
  `);

  const antRows = await db.execute<{
    tienda: string; ventas: string; margen: string;
  }>(sql`
    SELECT
      tienda,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${ant.desde} AND ${ant.hasta}
      AND categoria != 'anticipos'
      AND tienda IN (${sql.join(digitales.map(d => sql`${d}`), sql`, `)})
    GROUP BY tienda
  `);

  const antMap = new Map(antRows.map(r => [r.tienda, { ventas: Number(r.ventas), margen: Number(r.margen) }]));

  return rows.map((r) => {
    const ventasReal = Number(r.ventas);
    const costeReal = Number(r.coste);
    const margenReal = Number(r.margen);
    const antData = antMap.get(r.tienda);
    const ventasAnterior = antData?.ventas || 0;
    const margenAnterior = antData?.margen || 0;

    return {
      codigo: r.tienda,
      nombre: TIENDA_NOMBRES[r.tienda] || r.tienda,
      ventasReal,
      costeReal,
      margenReal,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      ventasAnterior,
      margenAnterior,
      pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
    };
  });
}

export async function getHeatmapData(desde: string, hasta: string): Promise<HeatmapCell[]> {
  const fisicas = TIENDAS_FISICAS;

  const rows = await db.execute<{
    tienda: string; categoria: string; ventas: string; margen: string;
  }>(sql`
    SELECT
      tienda,
      categoria,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria != 'anticipos'
      AND tienda IN (${sql.join(fisicas.map(f => sql`${f}`), sql`, `)})
    GROUP BY tienda, categoria
    ORDER BY tienda, categoria
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas);
    const margenReal = Number(r.margen);
    return {
      tienda: r.tienda,
      categoria: r.categoria,
      ventasReal,
      margenReal,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
    };
  });
}

export async function getCategoriaDetalle(desde: string, hasta: string, categoria: string): Promise<{
  tienda: string;
  nombre: string;
  ventasReal: number;
  margenReal: number;
  mbPct: number;
}[]> {
  const rows = await db.execute<{
    tienda: string; ventas: string; margen: string;
  }>(sql`
    SELECT
      tienda,
      COALESCE(SUM(venta), 0)::text as ventas,
      COALESCE(SUM(margen), 0)::text as margen
    FROM direccion.cuadro_mando
    WHERE fecha BETWEEN ${desde} AND ${hasta}
      AND categoria = ${categoria}
    GROUP BY tienda
    HAVING SUM(venta) > 0
    ORDER BY SUM(venta) DESC
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas);
    const margenReal = Number(r.margen);
    return {
      tienda: r.tienda,
      nombre: TIENDA_NOMBRES[r.tienda] || r.tienda,
      ventasReal,
      margenReal,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
    };
  });
}

// Legacy compatibility — for API routes
export async function getDefaultPeriod() {
  const range = await getDefaultRange();
  const d = new Date(range.desde);
  return { anio: d.getFullYear(), mes: d.getMonth() + 1 };
}

export async function getAvailablePeriods() {
  const rows = await db.execute<{ anio: string; mes: string }>(sql`
    SELECT DISTINCT
      EXTRACT(YEAR FROM fecha)::text as anio,
      EXTRACT(MONTH FROM fecha)::text as mes
    FROM direccion.cuadro_mando
    ORDER BY anio DESC, mes DESC
  `);
  return rows.map(r => ({ anio: Number(r.anio), mes: Number(r.mes) }));
}
