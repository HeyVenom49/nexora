import { check, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { productVariants } from "./product-variants";
import { sql } from "drizzle-orm";

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .unique("inventory_variant_unique")
      .references(() => productVariants.id, {
        onDelete: "restrict",
      }),
    totalQuantity: integer("total_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("inventory_total_non_negative", sql`${table.totalQuantity} >= 0`),
    check(
      "inventory_reserved_non_negative",
      sql`${table.reservedQuantity} >= 0`,
    ),
    check(
      "inventory_reserved_not_exceed_total",
      sql`${table.reservedQuantity} <= ${table.totalQuantity}`,
    ),
  ],
);
