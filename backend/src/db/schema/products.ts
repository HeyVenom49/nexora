import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 })
      .notNull()
      .unique("products_slug_unique"),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("products_name_not_empty", sql`length(trim(${table.name})) > 0`),
    check(
      "products_status_valid",
      sql`${table.status} IN ('draft', 'active', 'archived')`,
    ),
  ],
);
