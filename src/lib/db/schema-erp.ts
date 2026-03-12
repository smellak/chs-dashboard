import { pgSchema, serial, varchar, numeric, integer, date, text, timestamp } from "drizzle-orm/pg-core";

export const erpSchema = pgSchema("erp");

export const pedidosRaw = erpSchema.table("pedidos_raw", {
  id: serial("id").primaryKey(),
  pedidoNumero: varchar("pedido_numero", { length: 20 }).notNull(),
  pedidoEjercicio: varchar("pedido_ejercicio", { length: 10 }),
  clienteNombre: varchar("cliente_nombre", { length: 255 }),
  direccion: varchar("direccion", { length: 255 }),
  direccion2: varchar("direccion2", { length: 255 }),
  poblacion: varchar("poblacion", { length: 100 }),
  cp: varchar("cp", { length: 20 }),
  telefono1: varchar("telefono1", { length: 30 }),
  telefono2: varchar("telefono2", { length: 30 }),
  telefono3: varchar("telefono3", { length: 30 }),
  importeTotal: numeric("importe_total", { precision: 12, scale: 2 }),
  pendienteEntrega: numeric("pendiente_entrega", { precision: 12, scale: 2 }),
  diasRetraso: integer("dias_retraso"),
  fechaServicio: date("fecha_servicio"),
  fechaPedido: date("fecha_pedido"),
  situacionCodigo: integer("situacion_codigo"),
  situacionNombre: varchar("situacion_nombre", { length: 50 }),
  productoCategoria: varchar("producto_categoria", { length: 10 }),
  observacion: text("observacion"),
  createdAt: timestamp("created_at"),
});
