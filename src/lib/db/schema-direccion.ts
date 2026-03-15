import { pgSchema, uuid, integer, varchar, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const direccionSchema = pgSchema("direccion");

export const tiendas = direccionSchema.table("tiendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: varchar("codigo", { length: 50 }).unique().notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull().default("tienda_fisica"),
  latitud: numeric("latitud", { precision: 9, scale: 6 }),
  longitud: numeric("longitud", { precision: 9, scale: 6 }),
  activa: boolean("activa").default(true),
  orden: integer("orden").default(0),
});

export const categorias = direccionSchema.table("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: varchar("codigo", { length: 50 }).unique().notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  icono: varchar("icono", { length: 10 }),
  color: varchar("color", { length: 7 }).notNull(),
  colorLight: varchar("color_light", { length: 7 }).notNull(),
  orden: integer("orden").default(0),
});
