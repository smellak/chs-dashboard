import { pgSchema, uuid, integer, varchar, numeric, boolean, timestamp, text, index, uniqueIndex } from "drizzle-orm/pg-core";

export const direccionSchema = pgSchema("direccion");

export const objetivos = direccionSchema.table("objetivos", {
  id: uuid("id").primaryKey().defaultRandom(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  canal: varchar("canal", { length: 50 }).notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  objetivoVentas: numeric("objetivo_ventas", { precision: 12, scale: 2 }).notNull().default("0"),
  objetivoMargen: numeric("objetivo_margen", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("objetivos_unique").on(table.anio, table.mes, table.canal, table.categoria),
  index("idx_objetivos_periodo").on(table.anio, table.mes),
]);

export const historicoAnual = direccionSchema.table("historico_anual", {
  id: uuid("id").primaryKey().defaultRandom(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  canal: varchar("canal", { length: 50 }).notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  ventasReal: numeric("ventas_real", { precision: 12, scale: 2 }).notNull().default("0"),
  margenReal: numeric("margen_real", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("historico_unique").on(table.anio, table.mes, table.canal, table.categoria),
  index("idx_historico_periodo").on(table.anio, table.mes),
]);

export const tiendas = direccionSchema.table("tiendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: varchar("codigo", { length: 50 }).unique().notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
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

export const subfamilias = direccionSchema.table("subfamilias", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoriaCodigo: varchar("categoria_codigo", { length: 50 }).notNull().references(() => categorias.codigo),
  codigoFamilia: varchar("codigo_familia", { length: 10 }),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  orden: integer("orden").default(0),
});
