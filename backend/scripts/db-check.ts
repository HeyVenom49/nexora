import { client, db } from "../src/db";
import { users } from "../src/db/schema";

try {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .limit(1);

  console.log("Drizzle query successful:", result);
} finally {
  await client.end();
}
