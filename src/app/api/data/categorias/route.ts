import { NextRequest } from "next/server";
import { getDatosCategorias, getHeatmapData, getLatestPeriod } from "@/lib/queries/ventas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const { anio: defaultAnio, mes: defaultMes } = await getLatestPeriod();
  const anio = Number(params.get("anio") || defaultAnio);
  const mes = Number(params.get("mes") || defaultMes);

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
