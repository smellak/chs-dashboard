import { NextRequest } from "next/server";
import { getResumenEmpresa, getDatosCategorias, getDatosTiendas } from "@/lib/queries/ventas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const anio = Number(params.get("anio") || 2025);
  const mes = Number(params.get("mes") || 7);

  try {
    const [resumen, categorias, tiendas] = await Promise.all([
      getResumenEmpresa(anio, mes),
      getDatosCategorias(anio, mes),
      getDatosTiendas(anio, mes),
    ]);

    return Response.json({ anio, mes, resumen, categorias, tiendas });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
