import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface ResumenEmpresa {
  ventasReal: number;
  ventasObjetivo: number;
  ventasAnterior: number;
  margenReal: number;
  margenObjetivo: number;
  margenAnterior: number;
  mbPct: number;
  pctObjetivo: number;
  pctAnterior: number;
}

export interface DatosTienda {
  codigo: string;
  nombre: string;
  tipo: string;
  latitud: number | null;
  longitud: number | null;
  ventasReal: number;
  ventasObjetivo: number;
  ventasAnterior: number;
  margenReal: number;
  margenObjetivo: number;
  mbPct: number;
  pctObjetivo: number;
  pctAnterior: number;
}

export interface DatosCategoria {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  colorLight: string;
  ventasReal: number;
  ventasObjetivo: number;
  ventasAnterior: number;
  margenReal: number;
  margenObjetivo: number;
  mbPct: number;
  pctObjetivo: number;
}

export interface DatosCanal {
  codigo: string;
  nombre: string;
  ventasReal: number;
  ventasObjetivo: number;
  ventasAnterior: number;
  pctObjetivo: number;
  pctAnterior: number;
}

/** Returns the most recent (anio, mes) available in erp.ventas_real */
export async function getLatestPeriod(): Promise<{ anio: number; mes: number }> {
  const [row] = await db.execute<{ anio: number; mes: number }>(sql`
    SELECT anio, mes
    FROM erp.ventas_real
    ORDER BY anio DESC, mes DESC
    LIMIT 1
  `);
  return row ?? { anio: 2025, mes: 1 };
}

export async function getResumenEmpresa(anio: number, mes: number): Promise<ResumenEmpresa> {
  const [real] = await db.execute<{
    venta_neta: string;
    margen: string;
  }>(sql`
    SELECT
      COALESCE(venta_neta, 0) as venta_neta,
      COALESCE(margen, 0) as margen
    FROM erp.ventas_real
    WHERE anio = ${anio} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const [objetivo] = await db.execute<{
    objetivo_ventas: string;
    objetivo_margen: string;
  }>(sql`
    SELECT
      COALESCE(objetivo_ventas, 0) as objetivo_ventas,
      COALESCE(objetivo_margen, 0) as objetivo_margen
    FROM erp.objetivos_direccion
    WHERE anio = ${anio} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const [anterior] = await db.execute<{
    venta_neta: string;
    margen: string;
  }>(sql`
    SELECT
      COALESCE(venta_neta, 0) as venta_neta,
      COALESCE(margen, 0) as margen
    FROM erp.ventas_real
    WHERE anio = ${anio - 1} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const ventasReal = Number(real?.venta_neta || 0);
  const margenReal = Number(real?.margen || 0);
  const ventasObjetivo = Number(objetivo?.objetivo_ventas || 0);
  const margenObjetivo = Number(objetivo?.objetivo_margen || 0);
  const ventasAnterior = Number(anterior?.venta_neta || 0);
  const margenAnterior = Number(anterior?.margen || 0);

  return {
    ventasReal,
    ventasObjetivo,
    ventasAnterior,
    margenReal,
    margenObjetivo,
    margenAnterior,
    mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
    pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
    pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
  };
}

export async function getDatosTiendas(anio: number, mes: number): Promise<DatosTienda[]> {
  const rows = await db.execute<{
    codigo: string;
    nombre: string;
    tipo: string;
    latitud: string | null;
    longitud: string | null;
    venta_neta: string;
    margen: string;
    ventas_objetivo: string;
    margen_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      t.codigo,
      t.nombre,
      t.tipo,
      t.latitud::text,
      t.longitud::text,
      COALESCE(v.venta_neta, 0) as venta_neta,
      COALESCE(v.margen, 0) as margen,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(va.venta_neta, 0) as ventas_anterior
    FROM direccion.tiendas t
    LEFT JOIN erp.ventas_real v
      ON v.canal = t.codigo AND v.anio = ${anio} AND v.mes = ${mes} AND v.categoria = 'total'
    LEFT JOIN erp.objetivos_direccion o
      ON o.canal = t.codigo AND o.anio = ${anio} AND o.mes = ${mes} AND o.categoria = 'total'
    LEFT JOIN erp.ventas_real va
      ON va.canal = t.codigo AND va.anio = ${anio - 1} AND va.mes = ${mes} AND va.categoria = 'total'
    WHERE t.activa = true AND t.codigo != 'empresa'
    ORDER BY t.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.venta_neta);
    const margenReal = Number(r.margen);
    const ventasObjetivo = Number(r.ventas_objetivo);
    const margenObjetivo = Number(r.margen_objetivo);
    const ventasAnterior = Number(r.ventas_anterior);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
      tipo: r.tipo,
      latitud: r.latitud ? Number(r.latitud) : null,
      longitud: r.longitud ? Number(r.longitud) : null,
      ventasReal,
      ventasObjetivo,
      ventasAnterior,
      margenReal,
      margenObjetivo,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
      pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
    };
  });
}

export async function getDatosCategorias(anio: number, mes: number): Promise<DatosCategoria[]> {
  const rows = await db.execute<{
    codigo: string;
    nombre: string;
    icono: string;
    color: string;
    color_light: string;
    venta_neta: string;
    margen: string;
    ventas_objetivo: string;
    margen_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      c.codigo,
      c.nombre,
      c.icono,
      c.color,
      c.color_light,
      COALESCE(v.venta_neta, 0) as venta_neta,
      COALESCE(v.margen, 0) as margen,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(va.venta_neta, 0) as ventas_anterior
    FROM direccion.categorias c
    LEFT JOIN erp.ventas_real v
      ON v.canal = 'empresa' AND v.categoria = c.codigo AND v.anio = ${anio} AND v.mes = ${mes}
    LEFT JOIN erp.objetivos_direccion o
      ON o.canal = 'empresa' AND o.categoria = c.codigo AND o.anio = ${anio} AND o.mes = ${mes}
    LEFT JOIN erp.ventas_real va
      ON va.canal = 'empresa' AND va.categoria = c.codigo AND va.anio = ${anio - 1} AND va.mes = ${mes}
    ORDER BY c.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.venta_neta);
    const margenReal = Number(r.margen);
    const ventasObjetivo = Number(r.ventas_objetivo);
    const margenObjetivo = Number(r.margen_objetivo);
    const ventasAnterior = Number(r.ventas_anterior);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
      icono: r.icono,
      color: r.color,
      colorLight: r.color_light,
      ventasReal,
      ventasObjetivo,
      ventasAnterior,
      margenReal,
      margenObjetivo,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
    };
  });
}

export async function getDatosCanales(anio: number, mes: number): Promise<DatosCanal[]> {
  const rows = await db.execute<{
    codigo: string;
    nombre: string;
    venta_neta: string;
    ventas_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      t.codigo,
      t.nombre,
      COALESCE(v.venta_neta, 0) as venta_neta,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(va.venta_neta, 0) as ventas_anterior
    FROM direccion.tiendas t
    LEFT JOIN erp.ventas_real v
      ON v.canal = t.codigo AND v.anio = ${anio} AND v.mes = ${mes} AND v.categoria = 'total'
    LEFT JOIN erp.objetivos_direccion o
      ON o.canal = t.codigo AND o.anio = ${anio} AND o.mes = ${mes} AND o.categoria = 'total'
    LEFT JOIN erp.ventas_real va
      ON va.canal = t.codigo AND va.anio = ${anio - 1} AND va.mes = ${mes} AND va.categoria = 'total'
    WHERE t.tipo IN ('ecommerce', 'marketplace')
    ORDER BY t.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.venta_neta);
    const ventasObjetivo = Number(r.ventas_objetivo);
    const ventasAnterior = Number(r.ventas_anterior);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
      ventasReal,
      ventasObjetivo,
      ventasAnterior,
      pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
      pctAnterior: ventasAnterior > 0 ? ((ventasReal - ventasAnterior) / ventasAnterior) * 100 : 0,
    };
  });
}

export async function getTiendaPorCategoria(anio: number, mes: number, tiendaCodigo: string): Promise<DatosCategoria[]> {
  const rows = await db.execute<{
    codigo: string;
    nombre: string;
    icono: string;
    color: string;
    color_light: string;
    venta_neta: string;
    margen: string;
    ventas_objetivo: string;
    margen_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      c.codigo,
      c.nombre,
      c.icono,
      c.color,
      c.color_light,
      COALESCE(v.venta_neta, 0) as venta_neta,
      COALESCE(v.margen, 0) as margen,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(va.venta_neta, 0) as ventas_anterior
    FROM direccion.categorias c
    LEFT JOIN erp.ventas_real v
      ON v.canal = ${tiendaCodigo} AND v.categoria = c.codigo AND v.anio = ${anio} AND v.mes = ${mes}
    LEFT JOIN erp.objetivos_direccion o
      ON o.canal = ${tiendaCodigo} AND o.categoria = c.codigo AND o.anio = ${anio} AND o.mes = ${mes}
    LEFT JOIN erp.ventas_real va
      ON va.canal = ${tiendaCodigo} AND va.categoria = c.codigo AND va.anio = ${anio - 1} AND va.mes = ${mes}
    ORDER BY c.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.venta_neta);
    const margenReal = Number(r.margen);
    const ventasObjetivo = Number(r.ventas_objetivo);
    const margenObjetivo = Number(r.margen_objetivo);
    const ventasAnterior = Number(r.ventas_anterior);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
      icono: r.icono,
      color: r.color,
      colorLight: r.color_light,
      ventasReal,
      ventasObjetivo,
      ventasAnterior,
      margenReal,
      margenObjetivo,
      mbPct: ventasReal > 0 ? (margenReal / ventasReal) * 100 : 0,
      pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
    };
  });
}

export async function getHeatmapData(anio: number, mes: number): Promise<{
  tienda: string;
  categoria: string;
  ventasReal: number;
  ventasObjetivo: number;
  pctObjetivo: number;
}[]> {
  const rows = await db.execute<{
    tienda: string;
    categoria: string;
    venta_neta: string;
    ventas_objetivo: string;
  }>(sql`
    SELECT
      v.canal as tienda,
      v.categoria,
      COALESCE(v.venta_neta, 0) as venta_neta,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo
    FROM erp.ventas_real v
    LEFT JOIN erp.objetivos_direccion o
      ON o.canal = v.canal AND o.categoria = v.categoria AND o.anio = v.anio AND o.mes = v.mes
    WHERE v.anio = ${anio} AND v.mes = ${mes}
      AND v.canal != 'empresa'
      AND v.categoria != 'total'
    ORDER BY v.canal, v.categoria
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.venta_neta);
    const ventasObjetivo = Number(r.ventas_objetivo);
    return {
      tienda: r.tienda,
      categoria: r.categoria,
      ventasReal,
      ventasObjetivo,
      pctObjetivo: ventasObjetivo > 0 ? (ventasReal / ventasObjetivo) * 100 : 0,
    };
  });
}
