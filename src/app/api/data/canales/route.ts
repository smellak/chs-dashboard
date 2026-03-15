import { NextRequest } from "next/server";
import { getDatosCanales, getLatestPeriod } from "@/lib/queries/ventas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const { anio: defaultAnio, mes: defaultMes } = await getLatestPeriod();
  const anio = Number(params.get("anio") || defaultAnio);
  const mes = Number(params.get("mes") || defaultMes);

  try {
    const canales = await getDatosCanales(anio, mes);
    const totalReal = canales.reduce((sum, c) => sum + c.ventasReal, 0);
    const totalObjetivo = canales.reduce((sum, c) => sum + c.ventasObjetivo, 0);

    return Response.json({ anio, mes, canales, totalReal, totalObjetivo });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
