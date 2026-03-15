import { NextResponse } from "next/server";
import { getDatosCanales, getDefaultRange } from "@/lib/queries/ventas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defaults = await getDefaultRange();
  const desde = searchParams.get("desde") || defaults.desde;
  const hasta = searchParams.get("hasta") || defaults.hasta;
  const canales = await getDatosCanales(desde, hasta);
  return NextResponse.json({ canales });
}
