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

export async function getResumenEmpresa(anio: number, mes: number): Promise<ResumenEmpresa> {
  const [real] = await db.execute<{
    ventas_real: string;
    margen_real: string;
  }>(sql`
    SELECT
      COALESCE(ventas_real, 0) as ventas_real,
      COALESCE(margen_real, 0) as margen_real
    FROM direccion.historico_anual
    WHERE anio = ${anio} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const [objetivo] = await db.execute<{
    objetivo_ventas: string;
    objetivo_margen: string;
  }>(sql`
    SELECT
      COALESCE(objetivo_ventas, 0) as objetivo_ventas,
      COALESCE(objetivo_margen, 0) as objetivo_margen
    FROM direccion.objetivos
    WHERE anio = ${anio} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const [anterior] = await db.execute<{
    ventas_real: string;
    margen_real: string;
  }>(sql`
    SELECT
      COALESCE(ventas_real, 0) as ventas_real,
      COALESCE(margen_real, 0) as margen_real
    FROM direccion.historico_anual
    WHERE anio = ${anio - 1} AND mes = ${mes} AND canal = 'empresa' AND categoria = 'total'
  `);

  const ventasReal = Number(real?.ventas_real || 0);
  const margenReal = Number(real?.margen_real || 0);
  const ventasObjetivo = Number(objetivo?.objetivo_ventas || 0);
  const margenObjetivo = Number(objetivo?.objetivo_margen || 0);
  const ventasAnterior = Number(anterior?.ventas_real || 0);
  const margenAnterior = Number(anterior?.margen_real || 0);

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
    latitud: string | null;
    longitud: string | null;
    ventas_real: string;
    margen_real: string;
    ventas_objetivo: string;
    margen_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      t.codigo,
      t.nombre,
      t.latitud::text,
      t.longitud::text,
      COALESCE(h.ventas_real, 0) as ventas_real,
      COALESCE(h.margen_real, 0) as margen_real,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(ha.ventas_real, 0) as ventas_anterior
    FROM direccion.tiendas t
    LEFT JOIN direccion.historico_anual h
      ON h.canal = t.codigo AND h.anio = ${anio} AND h.mes = ${mes} AND h.categoria = 'total'
    LEFT JOIN direccion.objetivos o
      ON o.canal = t.codigo AND o.anio = ${anio} AND o.mes = ${mes} AND o.categoria = 'total'
    LEFT JOIN direccion.historico_anual ha
      ON ha.canal = t.codigo AND ha.anio = ${anio - 1} AND ha.mes = ${mes} AND ha.categoria = 'total'
    WHERE t.activa = true
    ORDER BY t.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas_real);
    const margenReal = Number(r.margen_real);
    const ventasObjetivo = Number(r.ventas_objetivo);
    const margenObjetivo = Number(r.margen_objetivo);
    const ventasAnterior = Number(r.ventas_anterior);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
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
    ventas_real: string;
    margen_real: string;
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
      COALESCE(h.ventas_real, 0) as ventas_real,
      COALESCE(h.margen_real, 0) as margen_real,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(ha.ventas_real, 0) as ventas_anterior
    FROM direccion.categorias c
    LEFT JOIN direccion.historico_anual h
      ON h.canal = 'empresa' AND h.categoria = c.codigo AND h.anio = ${anio} AND h.mes = ${mes}
    LEFT JOIN direccion.objetivos o
      ON o.canal = 'empresa' AND o.categoria = c.codigo AND o.anio = ${anio} AND o.mes = ${mes}
    LEFT JOIN direccion.historico_anual ha
      ON ha.canal = 'empresa' AND ha.categoria = c.codigo AND ha.anio = ${anio - 1} AND ha.mes = ${mes}
    ORDER BY c.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas_real);
    const margenReal = Number(r.margen_real);
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
  const canalesOnline = ["chs_web", "shiito_es", "shiito_pt", "marketplaces"];

  const rows = await db.execute<{
    codigo: string;
    nombre: string;
    ventas_real: string;
    ventas_objetivo: string;
    ventas_anterior: string;
  }>(sql`
    SELECT
      t.codigo,
      t.nombre,
      COALESCE(h.ventas_real, 0) as ventas_real,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(ha.ventas_real, 0) as ventas_anterior
    FROM direccion.tiendas t
    LEFT JOIN direccion.historico_anual h
      ON h.canal = t.codigo AND h.anio = ${anio} AND h.mes = ${mes} AND h.categoria = 'total'
    LEFT JOIN direccion.objetivos o
      ON o.canal = t.codigo AND o.anio = ${anio} AND o.mes = ${mes} AND o.categoria = 'total'
    LEFT JOIN direccion.historico_anual ha
      ON ha.canal = t.codigo AND ha.anio = ${anio - 1} AND ha.mes = ${mes} AND ha.categoria = 'total'
    WHERE t.codigo = ANY(${canalesOnline})
    ORDER BY t.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas_real);
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
    ventas_real: string;
    margen_real: string;
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
      COALESCE(h.ventas_real, 0) as ventas_real,
      COALESCE(h.margen_real, 0) as margen_real,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo,
      COALESCE(o.objetivo_margen, 0) as margen_objetivo,
      COALESCE(ha.ventas_real, 0) as ventas_anterior
    FROM direccion.categorias c
    LEFT JOIN direccion.historico_anual h
      ON h.canal = ${tiendaCodigo} AND h.categoria = c.codigo AND h.anio = ${anio} AND h.mes = ${mes}
    LEFT JOIN direccion.objetivos o
      ON o.canal = ${tiendaCodigo} AND o.categoria = c.codigo AND o.anio = ${anio} AND o.mes = ${mes}
    LEFT JOIN direccion.historico_anual ha
      ON ha.canal = ${tiendaCodigo} AND ha.categoria = c.codigo AND ha.anio = ${anio - 1} AND ha.mes = ${mes}
    ORDER BY c.orden
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas_real);
    const margenReal = Number(r.margen_real);
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
    ventas_real: string;
    ventas_objetivo: string;
  }>(sql`
    SELECT
      h.canal as tienda,
      h.categoria,
      COALESCE(h.ventas_real, 0) as ventas_real,
      COALESCE(o.objetivo_ventas, 0) as ventas_objetivo
    FROM direccion.historico_anual h
    LEFT JOIN direccion.objetivos o
      ON o.canal = h.canal AND o.categoria = h.categoria AND o.anio = h.anio AND o.mes = h.mes
    WHERE h.anio = ${anio} AND h.mes = ${mes}
      AND h.canal NOT IN ('empresa')
      AND h.categoria != 'total'
    ORDER BY h.canal, h.categoria
  `);

  return rows.map((r) => {
    const ventasReal = Number(r.ventas_real);
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
