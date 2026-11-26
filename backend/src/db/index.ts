import postgres from "postgres";
import { env } from "../config/env";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export { client };
