import { NextResponse } from "next/server";
import { getDatosCategorias, getHeatmapData, getDefaultRange } from "@/lib/queries/ventas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defaults = await getDefaultRange();
  const desde = searchParams.get("desde") || defaults.desde;
  const hasta = searchParams.get("hasta") || defaults.hasta;
  const [categorias, heatmap] = await Promise.all([
    getDatosCategorias(desde, hasta),
    getHeatmapData(desde, hasta),
  ]);
  return NextResponse.json({ categorias, heatmap });
}
