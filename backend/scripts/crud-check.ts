import { eq } from "drizzle-orm";
import { client, db } from "../src/db";
import { users } from "../src/db/schema";

const testEmail = `test-${crypto.randomUUID()}@example.com`;

async function main() {
  let userId: string | undefined;

  try {
    // INSERT
    const [createdUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        passwordHash: "test-hash-not-a-real-password",
      })
      .returning();

    userId = createdUser.id;

    console.log("Created:", createdUser.email);

    // READ
    const [foundUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    console.log("Read:", foundUser.email);

    const previousUpdatedAt = foundUser.updatedAt;

    // Timestamp difference clearly visible
    await Bun.sleep(1100);

    // UPDATE
    const [updatedUser] = await db
      .update(users)
      .set({ email: `update-${testEmail}` })
      .where(eq(users.id, userId))
      .returning();

    console.log("Updated:", updatedUser.email);

    // VERIFY TRIGGER
    console.log("Before:", previousUpdatedAt);
    console.log("After:", updatedUser.updatedAt);

    if (updatedUser.updatedAt.getTime() <= previousUpdatedAt.getTime()) {
      throw new Error("updated_at trigger verification failed");
    }
    console.log("Trigger verified ✅");
  } finally {
    // CLEANUP

    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
      console.log("Test user cleaned up");
    }

    await client.end();
  }
}

main().catch((error) => {
  console.error("CRUD check failed:", error);
  process.exitCode = 1;
});
