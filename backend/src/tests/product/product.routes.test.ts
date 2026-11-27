import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Server } from "node:http";
import { eq, inArray } from "drizzle-orm";
import { app } from "../../app";
import { db } from "../../db";
import {
  permissions,
  products,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "../../db/schema";
import {
  ProductRepository,
  type Product,
} from "../../modules/products/product.repository";
import { TokenService } from "../../security/token-service";

const REQUIRED_PERMISSION_KEYS = [
  "product:read",
  "product:create",
  "product:update",
  "product:archive",
] as const;

const repository = new ProductRepository(db);

let server: Server;
let baseUrl: string;
let product: Product;
let authHeaders: { Authorization: string };
let noRoleHeaders: { Authorization: string };

const createdProductIds: string[] = [];
const createdUserIds: string[] = [];
let createdRoleId: string | undefined;

async function createProductForTest(label: string): Promise<Product> {
  const created = await repository.create({
    name: `Routes Test ${label}`,
    slug: `routes-test-${crypto.randomUUID()}`,
    description: "Product routes integration test",
  });

  createdProductIds.push(created.id);

  return created;
}

beforeAll(async () => {
  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not start test server");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;

  // Permissions are seeded by migration 0013. Look them up by key.
  const requiredPermissions = await db
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(inArray(permissions.key, [...REQUIRED_PERMISSION_KEYS]));

  if (requiredPermissions.length !== REQUIRED_PERMISSION_KEYS.length) {
    throw new Error("Product permissions are missing; run migrations first");
  }

  const [role] = await db
    .insert(roles)
    .values({ key: `rt-role-${crypto.randomUUID()}` })
    .returning({ id: roles.id });

  if (!role) throw new Error("Failed to create test role");
  createdRoleId = role.id;

  await db.insert(rolePermissions).values(
    requiredPermissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
  );

  const [user] = await db
    .insert(users)
    .values({
      email: `routes-test-${crypto.randomUUID()}@example.com`,
      passwordHash: "not-a-real-hash",
    })
    .returning({ id: users.id });

  if (!user) throw new Error("Failed to create test user");
  createdUserIds.push(user.id);

  await db.insert(userRoles).values({ userId: user.id, roleId: role.id });

  const tokenService = new TokenService();

  // authenticate only verifies the JWT, so the user row is needed only for permissions.
  authHeaders = {
    Authorization: `Bearer ${await tokenService.generateAccessToken(user.id)}`,
  };

  // Valid token, but this user id has no roles, so every product permission is denied.
  noRoleHeaders = {
    Authorization: `Bearer ${await tokenService.generateAccessToken(crypto.randomUUID())}`,
  };

  product = await createProductForTest("Keyboard");
});

afterAll(async () => {
  server?.close();

  if (createdProductIds.length > 0) {
    await db.delete(products).where(inArray(products.id, createdProductIds));
  }

  // Deleting users and the role cascades to user_roles and role_permissions.
  if (createdUserIds.length > 0) {
    await db.delete(users).where(inArray(users.id, createdUserIds));
  }

  if (createdRoleId) {
    await db.delete(roles).where(eq(roles.id, createdRoleId));
  }
});

describe("Product routes integration", () => {
  it("rejects requests without an access token", async () => {
    const response = await fetch(`${baseUrl}/api/products/${product.id}`);

    expect(response.status).toBe(401);
  });

  it("rejects an invalid product UUID", async () => {
    const response = await fetch(`${baseUrl}/api/products/not-a-valid-uuid`, {
      headers: authHeaders,
    });

    expect(response.status).toBe(400);
  });

  it("returns a product by ID", async () => {
    const response = await fetch(`${baseUrl}/api/products/${product.id}`, {
      headers: authHeaders,
    });

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.id).toBe(product.id);
  });

  it("returns a product by slug", async () => {
    const response = await fetch(
      `${baseUrl}/api/products/slug/${product.slug}`,
      { headers: authHeaders },
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.slug).toBe(product.slug);
  });

  it("returns 404 for a product that does not exist", async () => {
    const nonExistentId = "00000000-0000-4000-8000-000000000000";

    const response = await fetch(`${baseUrl}/api/products/${nonExistentId}`, {
      headers: authHeaders,
    });

    expect(response.status).toBe(404);
  });
});

describe("Archive product route", () => {
  it("archives a product and returns it", async () => {
    const target = await createProductForTest("Archive");

    const response = await fetch(
      `${baseUrl}/api/products/${target.id}/archive`,
      { method: "PATCH", headers: authHeaders },
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.id).toBe(target.id);
    expect(body.data.status).toBe("archived");
  });

  it("returns 409 when the product is already archived", async () => {
    const target = await createProductForTest("Archive twice");

    const first = await fetch(
      `${baseUrl}/api/products/${target.id}/archive`,
      { method: "PATCH", headers: authHeaders },
    );
    expect(first.status).toBe(200);

    const second = await fetch(
      `${baseUrl}/api/products/${target.id}/archive`,
      { method: "PATCH", headers: authHeaders },
    );

    expect(second.status).toBe(409);
  });

  it("returns 404 when archiving a product that does not exist", async () => {
    const nonExistentId = "00000000-0000-4000-8000-000000000000";

    const response = await fetch(
      `${baseUrl}/api/products/${nonExistentId}/archive`,
      { method: "PATCH", headers: authHeaders },
    );

    expect(response.status).toBe(404);
  });

  it("returns 403 and leaves the product unchanged without product:archive", async () => {
    const target = await createProductForTest("Forbidden");

    const response = await fetch(
      `${baseUrl}/api/products/${target.id}/archive`,
      { method: "PATCH", headers: noRoleHeaders },
    );

    expect(response.status).toBe(403);

    const unchanged = await repository.findById(target.id);

    expect(unchanged?.status).toBe("draft");
  });
});
