import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { productVariants } from "./product-variants";
import { sql } from "drizzle-orm";

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("inventory_reservations_quantity_check", sql`${table.quantity} > 0`),
    check(
      "inventory_reservations_status_check",
      sql`${table.status} IN ('active', 'committed', 'released', 'expired')`,
    ),
    index("inventory_reservations_order_id_idx").on(table.orderId),
    index("inventory_reservations_variant_id_idx").on(table.variantId),
    index("inventory_reservations_active_expiry_idx")
      .on(table.expiresAt)
      .where(sql`${table.status} = 'active'`),
  ],
);
