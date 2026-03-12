import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({
      status: "ok",
      db: true,
      timestamp: new Date().toISOString(),
      app: "chs-dashboard",
      version: "1.0.0",
    });
  } catch (error) {
    return Response.json({
      status: "error",
      db: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 503 });
  }
}
