import { NextResponse } from "next/server";
import { getDatosTiendas, getDefaultRange } from "@/lib/queries/ventas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defaults = await getDefaultRange();
  const desde = searchParams.get("desde") || defaults.desde;
  const hasta = searchParams.get("hasta") || defaults.hasta;
  const tiendas = await getDatosTiendas(desde, hasta);
  return NextResponse.json({ tiendas });
}
