import { pgSchema, serial, integer, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

export const erpSchema = pgSchema("erp");

export const ventasReal = erpSchema.table("ventas_real", {
  id: serial("id").primaryKey(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  tiendaCodigo: varchar("tienda_codigo", { length: 10 }).notNull(),
  tienda: varchar("tienda", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  ventaBruta: numeric("venta_bruta", { precision: 14, scale: 2 }),
  ventaNeta: numeric("venta_neta", { precision: 14, scale: 2 }),
  coste: numeric("coste", { precision: 14, scale: 2 }),
  margen: numeric("margen", { precision: 14, scale: 2 }),
  margenPct: numeric("margen_pct", { precision: 8, scale: 2 }),
  numLineas: integer("num_lineas"),
  numUnidades: numeric("num_unidades", { precision: 12, scale: 2 }),
  canal: varchar("canal", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

export const objetivosDireccion = erpSchema.table("objetivos_direccion", {
  id: serial("id").primaryKey(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  canal: varchar("canal", { length: 50 }).notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  objetivoVentas: numeric("objetivo_ventas", { precision: 14, scale: 2 }),
  objetivoMargen: numeric("objetivo_margen", { precision: 14, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
});
