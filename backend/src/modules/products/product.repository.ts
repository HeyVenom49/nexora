import { eq } from "drizzle-orm";
import { db } from "../../db";
import { products } from "../../db/schema";

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type UpdateProduct = Partial<
  Pick<NewProduct, "name" | "slug" | "description" | "status">
>;

export class ProductRepository {
  constructor(private readonly database: typeof db) {}

  public async create(input: NewProduct): Promise<Product> {
    const [product] = await this.database
      .insert(products)
      .values(input)
      .returning();

    return product;
  }

  public async findById(productId: string): Promise<Product | null> {
    const [product] = await this.database
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    return product ?? null;
  }

  public async findBySlug(slug: string): Promise<Product | null> {
    const [product] = await this.database
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    return product ?? null;
  }

  public async existsBySlug(slug: string): Promise<boolean> {
    const [product] = await this.database
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    return product !== undefined;
  }

  public async updateById(
    productId: string,
    input: UpdateProduct,
  ): Promise<Product | null> {
    const [product] = await this.database
      .update(products)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    return product ?? null;
  }

  public async archiveById(productId: string): Promise<Product | null> {
    const [product] = await this.database
      .update(products)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();

    return product ?? null;
  }
}
