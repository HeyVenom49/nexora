import {
  bigint,
  check,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { sql } from "drizzle-orm";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerPaymentId: varchar("provider_payment_id", {
      length: 255,
    }),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("payments_provider_idempotency_unique").on(
      table.provider,
      table.idempotencyKey,
    ),

    unique("payments_provider_payment_id_unique").on(
      table.provider,
      table.providerPaymentId,
    ),

    index("payments_order_id_idx").on(table.orderId),

    check("payments_amount_positive", sql`${table.amount} > 0`),

    check(
      "payments_status_valid",
      sql`${table.status} IN (
            'pending',
            'succeeded',
            'failed',
            'cancelled',
            'unknown'
        )`,
    ),

    check("payments_currency_format", sql`${table.currency} ~ '^[A-Z]{3}$'`),
  ],
);
