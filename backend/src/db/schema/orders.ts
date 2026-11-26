import {
  bigint,
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 32 })
      .notNull()
      .unique("orders_order_number_unique"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending_payment"),
    subtotalAmount: bigint("subtotal_amount", { mode: "number" }).notNull(),
    discountAmount: bigint("discount_amount", { mode: "number" })
      .notNull()
      .default(0),
    shippingAmount: bigint("shipping_amount", { mode: "number" })
      .notNull()
      .default(0),
    taxAmount: bigint("tax_amount", { mode: "number" }).notNull().default(0),
    totalAmount: bigint("total_amount", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    shippingAddressSnapshot: jsonb("shipping_address_snapshot").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "orders_status_valid",
      sql`${table.status} IN (
            'pending_payment',
            'confirmed',
            'processing',
            'fulfilled',
            'cancelled'
        )`,
    ),
    check(
      "orders_amounts_non_negative",
      sql`
            ${table.subtotalAmount} >= 0
            AND ${table.discountAmount} >= 0
            AND ${table.shippingAmount} >= 0
            AND ${table.taxAmount} >= 0
            AND ${table.totalAmount} >= 0
        `,
    ),
    check(
      "orders_total_matches_breakdown",
      sql`
            ${table.totalAmount} = ${table.subtotalAmount} - ${table.discountAmount} + ${table.shippingAmount} + ${table.taxAmount}
        `,
    ),

    check("orders_currency_format", sql`${table.currency} ~ '^[A-Z]{3}$'`),

    index("orders_user_created_idx").on(table.userId, table.createdAt),
  ],
);
