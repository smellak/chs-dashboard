import { NextResponse } from "next/server";
import { getResumenEmpresa, getDatosCategorias, getDatosTiendas, getDefaultRange } from "@/lib/queries/ventas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defaults = await getDefaultRange();
  const desde = searchParams.get("desde") || defaults.desde;
  const hasta = searchParams.get("hasta") || defaults.hasta;
  const [resumen, categorias, tiendas] = await Promise.all([
    getResumenEmpresa(desde, hasta),
    getDatosCategorias(desde, hasta),
    getDatosTiendas(desde, hasta),
  ]);
  return NextResponse.json({ resumen, categorias, tiendas });
}
