import { defineConfig } from "drizzle-kit";

// Read only what drizzle-kit needs. Importing src/config/env would also
// require app-only variables such as JWT_SECRET just to run migrations.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run drizzle-kit");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",

  dbCredentials: {
    url: databaseUrl,
  },
});
