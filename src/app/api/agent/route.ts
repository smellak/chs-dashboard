import { NextRequest } from "next/server";
import { getResumenEmpresa, getDatosTiendas, getDatosCategorias } from "@/lib/queries/ventas";
import { fmtEur, fmtK, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AgentRequest {
  capability: string;
  parameters: {
    anio?: number;
    mes?: number;
    tienda?: string;
    categoria?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json();
    const { capability, parameters } = body;
    const anio = parameters.anio || 2025;
    const mes = parameters.mes || 7;

    switch (capability) {
      case "consultar_ventas": {
        const tiendas = await getDatosTiendas(anio, mes);
        const resumen = await getResumenEmpresa(anio, mes);

        if (parameters.tienda) {
          const tienda = tiendas.find((t) => t.codigo === parameters.tienda);
          if (!tienda) {
            return Response.json({ text: `No se encontró la tienda "${parameters.tienda}".`, success: false });
          }
          return Response.json({
            text: `${tienda.nombre}: ventas ${fmtEur(tienda.ventasReal)} (${pct(tienda.pctObjetivo)} del objetivo). Margen bruto: ${fmtEur(tienda.margenReal)} (MB ${pct(tienda.mbPct)}).`,
            success: true,
            data: tienda,
          });
        }

        return Response.json({
          text: `Ventas empresa ${mes}/${anio}: ${fmtEur(resumen.ventasReal)} (${pct(resumen.pctObjetivo)} del objetivo de ${fmtEur(resumen.ventasObjetivo)}). Var. interanual: ${resumen.pctAnterior >= 0 ? "+" : ""}${pct(resumen.pctAnterior)}.`,
          success: true,
          data: { resumen, tiendas },
        });
      }

      case "consultar_margenes": {
        const resumen = await getResumenEmpresa(anio, mes);
        const categorias = await getDatosCategorias(anio, mes);

        const catText = categorias
          .map((c) => `${c.nombre}: MB ${pct(c.mbPct)} (${fmtK(c.margenReal)} €)`)
          .join(". ");

        return Response.json({
          text: `Margen bruto empresa ${mes}/${anio}: ${fmtEur(resumen.margenReal)} (MB ${pct(resumen.mbPct)}). Por categoría: ${catText}.`,
          success: true,
          data: { resumen, categorias },
        });
      }

      case "comparar_tiendas": {
        const tiendas = await getDatosTiendas(anio, mes);
        const fisicas = tiendas.filter((t) =>
          ["motril", "juncaril", "almeria", "alban", "antequera"].includes(t.codigo)
        );

        const sorted = [...fisicas].sort((a, b) => b.pctObjetivo - a.pctObjetivo);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];

        const resumen = sorted
          .map((t, i) => `${i + 1}. ${t.nombre}: ${fmtK(t.ventasReal)} € (${pct(t.pctObjetivo)} obj.)`)
          .join("\n");

        return Response.json({
          text: `Ranking tiendas ${mes}/${anio}:\n${resumen}\n\nMejor: ${best.nombre} (${pct(best.pctObjetivo)} obj.). Peor: ${worst.nombre} (${pct(worst.pctObjetivo)} obj.).`,
          success: true,
          data: { ranking: sorted },
        });
      }

      case "resumen_ejecutivo": {
        const resumen = await getResumenEmpresa(anio, mes);
        const categorias = await getDatosCategorias(anio, mes);
        const tiendas = await getDatosTiendas(anio, mes);

        const fisicas = tiendas.filter((t) =>
          ["motril", "juncaril", "almeria", "alban", "antequera"].includes(t.codigo)
        );
        const bestStore = fisicas.reduce((a, b) => (a.pctObjetivo > b.pctObjetivo ? a : b));
        const worstStore = fisicas.reduce((a, b) => (a.pctObjetivo < b.pctObjetivo ? a : b));
        const bestCat = categorias.reduce((a, b) => (a.pctObjetivo > b.pctObjetivo ? a : b));

        const alerts: string[] = [];
        if (resumen.pctObjetivo < 95) alerts.push(`Ventas por debajo del objetivo (${pct(resumen.pctObjetivo)})`);
        fisicas.forEach((t) => {
          if (t.pctObjetivo < 85) alerts.push(`${t.nombre} muy por debajo del objetivo (${pct(t.pctObjetivo)})`);
        });

        const texto = `RESUMEN EJECUTIVO — ${mes}/${anio}

VENTAS: ${fmtEur(resumen.ventasReal)} de ${fmtEur(resumen.ventasObjetivo)} objetivo (${pct(resumen.pctObjetivo)})
MARGEN: ${fmtEur(resumen.margenReal)} (MB ${pct(resumen.mbPct)})
YoY: ${resumen.pctAnterior >= 0 ? "+" : ""}${pct(resumen.pctAnterior)} vs ${anio - 1}

HIGHLIGHTS:
- Mejor tienda: ${bestStore.nombre} (${pct(bestStore.pctObjetivo)} obj.)
- Mejor categoría: ${bestCat.nombre} (${pct(bestCat.pctObjetivo)} obj.)
- Tienda a vigilar: ${worstStore.nombre} (${pct(worstStore.pctObjetivo)} obj.)

${alerts.length > 0 ? "ALERTAS:\n" + alerts.map((a) => `⚠ ${a}`).join("\n") : "Sin alertas."}`;

        return Response.json({
          text: texto,
          success: true,
          data: { resumen, categorias, tiendas: fisicas, alerts },
        });
      }

      default:
        return Response.json({
          text: `Capability "${capability}" no reconocida. Disponibles: consultar_ventas, consultar_margenes, comparar_tiendas, resumen_ejecutivo.`,
          success: false,
          error: "CAPABILITY_NOT_FOUND",
        });
    }
  } catch (error) {
    return Response.json({
      text: `Error interno: ${error instanceof Error ? error.message : "Unknown"}`,
      success: false,
      error: "INTERNAL_ERROR",
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    name: "Agente Dashboard",
    description: "Consulta datos de ventas, márgenes y rendimiento del Cuadro de Dirección",
    capabilities: [
      {
        name: "consultar_ventas",
        description: "Consulta ventas acumuladas del mes por tienda o categoría",
        requiredPermission: "read",
        parameters: {
          anio: { type: "number", description: "Año", optional: true },
          mes: { type: "number", description: "Mes (1-12)", optional: true },
          tienda: { type: "string", description: "Código de tienda", optional: true },
          categoria: { type: "string", description: "Código categoría", optional: true },
        },
      },
      {
        name: "consultar_margenes",
        description: "Consulta márgenes brutos por tienda o categoría",
        requiredPermission: "read",
        parameters: {
          anio: { type: "number", optional: true },
          mes: { type: "number", optional: true },
        },
      },
      {
        name: "comparar_tiendas",
        description: "Compara rendimiento de todas las tiendas",
        requiredPermission: "read",
        parameters: {
          anio: { type: "number", optional: true },
          mes: { type: "number", optional: true },
        },
      },
      {
        name: "resumen_ejecutivo",
        description: "Genera resumen ejecutivo del mes con KPIs, alertas y highlights",
        requiredPermission: "read",
        parameters: {
          anio: { type: "number", optional: true },
          mes: { type: "number", optional: true },
        },
      },
    ],
  });
}
