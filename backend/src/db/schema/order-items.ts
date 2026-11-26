import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { productVariants } from "./product-variants";
import { sql } from "drizzle-orm";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    attributesSnapshot: jsonb("attributes_snapshot")
      .notNull()
      .default(sql`'{}'::jsonb`),
    unitPriceAmount: bigint("unit_price_amount", { mode: "number" }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalAmount: bigint("line_total_amount", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_unit_price_non_negative",
      sql`${table.unitPriceAmount} >= 0`,
    ),
    check(
      "order_items_line_total_correct",
      sql`
            ${table.lineTotalAmount} = ${table.unitPriceAmount} * ${table.quantity}
        `,
    ),
    check("order_items_currency_format", sql`${table.currency} ~ '^[A-Z]{3}$'`),
  ],
);
