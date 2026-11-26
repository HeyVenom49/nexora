import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export type User = typeof users.$inferSelect;

export type NewUser = typeof users.$inferInsert;

export class UserRepository {
  public async findById(userId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user ?? null;
  }

  public async create(input: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(input).returning();

    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }
}
