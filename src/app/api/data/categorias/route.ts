import { NextRequest } from "next/server";
import { getDatosCategorias, getHeatmapData } from "@/lib/queries/ventas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const anio = Number(params.get("anio") || 2025);
  const mes = Number(params.get("mes") || 7);

  try {
    const [categorias, heatmap] = await Promise.all([
      getDatosCategorias(anio, mes),
      getHeatmapData(anio, mes),
    ]);

    return Response.json({ anio, mes, categorias, heatmap });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
