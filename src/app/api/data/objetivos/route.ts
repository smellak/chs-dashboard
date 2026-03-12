import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const anio = Number(params.get("anio") || 2025);
  const mes = Number(params.get("mes") || 7);

  try {
    const rows = await db.execute(sql`
      SELECT canal, categoria, objetivo_ventas, objetivo_margen
      FROM direccion.objetivos
      WHERE anio = ${anio} AND mes = ${mes}
      ORDER BY canal, categoria
    `);

    return Response.json({ anio, mes, objetivos: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anio, mes, canal, categoria, objetivo_ventas, objetivo_margen } = body;

    await db.execute(sql`
      INSERT INTO direccion.objetivos (anio, mes, canal, categoria, objetivo_ventas, objetivo_margen)
      VALUES (${anio}, ${mes}, ${canal}, ${categoria}, ${objetivo_ventas}, ${objetivo_margen})
      ON CONFLICT (anio, mes, canal, categoria)
      DO UPDATE SET
        objetivo_ventas = ${objetivo_ventas},
        objetivo_margen = ${objetivo_margen},
        updated_at = NOW()
    `);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
