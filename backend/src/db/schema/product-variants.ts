import {
  bigint,
  boolean,
  check,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { sql } from "drizzle-orm";

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
      }),
    sku: varchar("sku", { length: 100 })
      .notNull()
      .unique("product_variants_sku_unique"),
    attributes: jsonb("attributes")
      .notNull()
      .default(sql`'{}'::jsonb`),
    priceAmount: bigint("price_amount", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "product_variants_price_non_negative",
      sql`${table.priceAmount} >= 0`,
    ),
    check(
      "product_variants_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
  ],
);
