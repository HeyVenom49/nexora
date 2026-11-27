import { afterAll, test, expect } from "bun:test";
import { ProductRepository } from "../../modules/products/product.repository";
import { db } from "../../db";
import { products } from "../../db/schema";
import { inArray } from "drizzle-orm";

const repository = new ProductRepository(db);
const createdProductIds: string[] = [];

async function createTestProduct() {
  const product = await repository.create({
    name: "Test Mechanical Keyboard",
    slug: `keyboard-${crypto.randomUUID()}`,
    description: "Repository test product",
  });

  createdProductIds.push(product.id);

  return product;
}

afterAll(async () => {
  if (createdProductIds.length === 0) {
    return;
  }

  await db.delete(products).where(inArray(products.id, createdProductIds));
});

test("creates a product with database defaults", async () => {
  const product = await createTestProduct();

  expect(product.id).toBeDefined();
  expect(product.status).toBe("draft");
  expect(product.createdAt).toBeInstanceOf(Date);
  expect(product.updatedAt).toBeInstanceOf(Date);
});

test("finds a product by ID", async () => {
  const created = await createTestProduct();

  const found = await repository.findById(created.id);

  expect(found?.id).toBe(created.id);
  expect(found?.slug).toBe(created.slug);
});

test("returns null when products ID does not exist", async () => {
  const found = await repository.findById(crypto.randomUUID());

  expect(found).toBeNull();
});

test("finds a product by slug", async () => {
  const created = await createTestProduct();

  const found = await repository.findBySlug(created.slug);

  expect(found?.id).toBe(created.id);
});

test("returns null when slug does not exist", async () => {
  const found = await repository.findBySlug(`missing-${crypto.randomUUID()}`);

  expect(found).toBeNull();
});

test("returns true when slug exists", async () => {
  const created = await createTestProduct();

  const exists = await repository.existsBySlug(created.slug);

  expect(exists).toBe(true);
});

test("returns false when slug does not exist", async () => {
  const exists = await repository.existsBySlug(
    `missing-${crypto.randomUUID()}`,
  );

  expect(exists).toBe(false);
});

test("updates an existing product", async () => {
  const created = await createTestProduct();

  const updated = await repository.updateById(created.id, {
    name: "Updated Keyboard",
    status: "active",
  });

  expect(updated?.name).toBe("Updated Keyboard");
  expect(updated?.status).toBe("active");
  expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
    created.updatedAt.getTime(),
  );
});

test("returns null when updating a missing product", async () => {
  const updated = await repository.updateById(crypto.randomUUID(), {
    name: "Does Not Exist",
  });

  expect(updated).toBeNull();
});
