import { NextRequest } from "next/server";
import { getResumenEmpresa, getDatosTiendas, getDatosCategorias, getDefaultRange } from "@/lib/queries/ventas";
import { fmtEur, fmtK, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AgentRequest {
  capability: string;
  parameters: {
    desde?: string;
    hasta?: string;
    tienda?: string;
    categoria?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json();
    const { capability, parameters } = body;
    const defaults = await getDefaultRange();
    const desde = parameters.desde || defaults.desde;
    const hasta = parameters.hasta || defaults.hasta;

    switch (capability) {
      case "consultar_ventas": {
        const tiendas = await getDatosTiendas(desde, hasta);
        const resumen = await getResumenEmpresa(desde, hasta);

        if (parameters.tienda) {
          const tienda = tiendas.find((t) => t.codigo === parameters.tienda);
          if (!tienda) {
            return Response.json({ text: `No se encontró la tienda "${parameters.tienda}".`, success: false });
          }
          return Response.json({
            text: `${tienda.nombre}: ventas ${fmtEur(tienda.ventasReal)}, margen ${fmtEur(tienda.margenReal)} (MB% ${pct(tienda.mbPct)}).`,
            success: true,
            data: tienda,
          });
        }

        const yoyText = resumen.hasAnterior
          ? ` Var. interanual: ${resumen.pctAnterior >= 0 ? "+" : ""}${pct(resumen.pctAnterior)}.`
          : "";
        return Response.json({
          text: `Ventas empresa ${desde} a ${hasta}: ${fmtEur(resumen.ventasReal)}, margen ${fmtEur(resumen.margenReal)} (MB% ${pct(resumen.mbPct)}).${yoyText}`,
          success: true,
          data: { resumen, tiendas },
        });
      }

      case "comparar_tiendas": {
        const tiendas = await getDatosTiendas(desde, hasta);
        const fisicas = tiendas.filter((t) => t.tipo === "tienda_fisica");
        const sorted = [...fisicas].sort((a, b) => b.ventasReal - a.ventasReal);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const resumenText = sorted.map((t, i) => `${i + 1}. ${t.nombre}: ${fmtK(t.ventasReal)} € (MB% ${pct(t.mbPct)})`).join("\n");
        return Response.json({
          text: `Ranking tiendas ${desde} a ${hasta}:\n${resumenText}\n\nMejor: ${best.nombre}. Menor: ${worst.nombre}.`,
          success: true,
          data: { ranking: sorted },
        });
      }

      case "resumen_ejecutivo": {
        const resumen = await getResumenEmpresa(desde, hasta);
        const categorias = await getDatosCategorias(desde, hasta);
        const tiendas = await getDatosTiendas(desde, hasta);
        const fisicas = tiendas.filter((t) => t.tipo === "tienda_fisica" && t.ventasReal > 0);
        const bestStore = fisicas.reduce((a, b) => (a.ventasReal > b.ventasReal ? a : b));
        const worstStore = fisicas.reduce((a, b) => (a.ventasReal < b.ventasReal ? a : b));
        const activeCats = categorias.filter((c) => c.ventasReal > 0);
        const bestCat = activeCats.reduce((a, b) => (a.ventasReal > b.ventasReal ? a : b));
        const yoyLine = resumen.hasAnterior ? `\nYoY: ${resumen.pctAnterior >= 0 ? "+" : ""}${pct(resumen.pctAnterior)}` : "";
        return Response.json({
          text: `RESUMEN EJECUTIVO — ${desde} a ${hasta}\n\nVENTAS: ${fmtEur(resumen.ventasReal)}\nMARGEN: ${fmtEur(resumen.margenReal)} (MB% ${pct(resumen.mbPct)})${yoyLine}\n\nHIGHLIGHTS:\n- Mayor venta: ${bestStore.nombre} (${fmtK(bestStore.ventasReal)} €)\n- Mejor categoría: ${bestCat.nombre} (${fmtK(bestCat.ventasReal)} €)\n- Tienda a vigilar: ${worstStore.nombre} (${fmtK(worstStore.ventasReal)} €)`,
          success: true,
          data: { resumen, categorias, tiendas: fisicas },
        });
      }

      default:
        return Response.json({
          text: `Capability "${capability}" no reconocida. Disponibles: consultar_ventas, comparar_tiendas, resumen_ejecutivo.`,
          success: false,
        });
    }
  } catch (error) {
    return Response.json({
      text: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      success: false,
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    name: "Agente Dashboard",
    description: "Consulta datos de ventas, márgenes y rendimiento del Cuadro de Dirección",
    capabilities: [
      { name: "consultar_ventas", description: "Consulta ventas y márgenes por rango de fecha" },
      { name: "comparar_tiendas", description: "Ranking de tiendas por ventas y margen" },
      { name: "resumen_ejecutivo", description: "Resumen ejecutivo con KPIs y highlights" },
    ],
  });
}
