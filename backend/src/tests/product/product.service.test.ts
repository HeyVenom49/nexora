import { afterEach, expect, mock, test } from "bun:test";

import { ConflictError } from "../../errors/conflict-error";
import { NotFoundError } from "../../errors/not-found-error";
import { ProductService } from "../../modules/products/product.service";
import type {
  NewProduct,
  Product,
  UpdateProduct,
  ProductRepository,
} from "../../modules/products/product.repository";

const product: Product = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Mechanical Keyboard",
  slug: "mechanical-keyboard",
  description: "A test product",
  status: "draft",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createService() {
  const repository = {
    create: mock(async (_input: NewProduct): Promise<Product> => product),
    findById: mock(async (_id: string): Promise<Product | null> => product),
    findBySlug: mock(async (_slug: string): Promise<Product | null> => product),
    existsBySlug: mock(async (_slug: string): Promise<boolean> => false),
    updateById: mock(
      async (_id: string, _input: UpdateProduct): Promise<Product | null> =>
        product,
    ),
    archiveById: mock(
      async (_id: string): Promise<Product | null> => ({
        ...product,
        status: "archived",
      }),
    ),
  };

  const service = new ProductService(
    repository as unknown as ProductRepository,
  );

  return { service, repository };
}

afterEach(() => {
  mock.restore();
});

test("creates a product", async () => {
  const { service, repository } = createService();

  const result = await service.createProduct({
    name: product.name,
    slug: product.slug,
    description: product.description,
  });

  expect(result).toEqual(product);
  expect(repository.create).toHaveBeenCalledTimes(1);
});

test("throws ConflictError when slug already exists", async () => {
  const { service, repository } = createService();

  repository.existsBySlug.mockResolvedValue(true);

  expect(
    service.createProduct({
      name: product.name,
      slug: product.slug,
    }),
  ).rejects.toBeInstanceOf(ConflictError);

  expect(repository.create).not.toHaveBeenCalled();
});

test("converts PostgreSQL unique violation into ConflictError", async () => {
  const { service, repository } = createService();

  const databaseError = Object.assign(new Error("Unique violation"), {
    code: "23505",
  });

  repository.create.mockRejectedValue(databaseError);

  expect(
    service.createProduct({
      name: product.name,
      slug: product.slug,
    }),
  ).rejects.toBeInstanceOf(ConflictError);
});

test("returns product when found by ID", async () => {
  const { service } = createService();

  const result = await service.getProductById(product.id);

  expect(result).toEqual(product);
});

test("throws NotFoundError when product ID does not exist", async () => {
  const { service, repository } = createService();

  repository.findById.mockResolvedValue(null);

  await expect(service.getProductById(product.id)).rejects.toBeInstanceOf(
    NotFoundError,
  );
});

test("returns product when found by slug", async () => {
  const { service } = createService();

  const result = await service.getProductBySlug(product.slug);

  expect(result).toEqual(product);
});

test("throws NotFoundError when slug does not exist", async () => {
  const { service, repository } = createService();

  repository.findBySlug.mockResolvedValue(null);

  expect(service.getProductBySlug("unknown-product")).rejects.toBeInstanceOf(
    NotFoundError,
  );
});

test("updates an existing product", async () => {
  const { service, repository } = createService();

  const result = await service.updateProduct(product.id, {
    name: "Updated Keyboard",
  });

  expect(result).toEqual(product);
  expect(repository.updateById).toHaveBeenCalledTimes(1);
});

test("throws NotFoundError when updating a missing product", async () => {
  const { service, repository } = createService();

  repository.updateById.mockResolvedValue(null);

  expect(
    service.updateProduct(product.id, {
      name: "Updated Keyboard",
    }),
  ).rejects.toBeInstanceOf(NotFoundError);
});

test("throws ConflictError when updating to an existing slug", async () => {
  const { service, repository } = createService();

  repository.existsBySlug.mockResolvedValue(true);

  repository.findById.mockResolvedValue({
    ...product,
    slug: "another-product",
  });

  expect(
    service.updateProduct(product.id, {
      slug: "existing-slug",
    }),
  ).rejects.toBeInstanceOf(ConflictError);

  expect(repository.updateById).not.toHaveBeenCalled();
});

test("archives a product", async () => {
  const { service, repository } = createService();
  const archived: Product = { ...product, status: "archived" };
  repository.archiveById.mockResolvedValue(archived);

  const result = await service.archiveProduct(product.id);

  expect(result).toEqual(archived);
  expect(repository.archiveById).toHaveBeenCalledWith(product.id);
});

test("throws NotFoundError when archiving a missing product", async () => {
  const { service, repository } = createService();
  repository.findById.mockResolvedValue(null);

  await expect(service.archiveProduct(product.id)).rejects.toBeInstanceOf(
    NotFoundError,
  );
  expect(repository.archiveById).not.toHaveBeenCalled();
});

test("throws ConflictError when the product is already archived", async () => {
  const { service, repository } = createService();
  repository.findById.mockResolvedValue({ ...product, status: "archived" });

  await expect(service.archiveProduct(product.id)).rejects.toBeInstanceOf(
    ConflictError,
  );
  expect(repository.archiveById).not.toHaveBeenCalled();
});

test("throws NotFoundError when the row disappears during archive", async () => {
  const { service, repository } = createService();
  repository.archiveById.mockResolvedValue(null);

  await expect(service.archiveProduct(product.id)).rejects.toBeInstanceOf(
    NotFoundError,
  );
});
