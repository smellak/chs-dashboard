import { NextRequest } from "next/server";
import { getDatosTiendas, getTiendaPorCategoria, getLatestPeriod } from "@/lib/queries/ventas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const { anio: defaultAnio, mes: defaultMes } = await getLatestPeriod();
  const anio = Number(params.get("anio") || defaultAnio);
  const mes = Number(params.get("mes") || defaultMes);
  const tienda = params.get("tienda");

  try {
    const tiendas = await getDatosTiendas(anio, mes);

    let detalle = null;
    if (tienda) {
      detalle = await getTiendaPorCategoria(anio, mes, tienda);
    }

    return Response.json({ anio, mes, tiendas, detalle });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
