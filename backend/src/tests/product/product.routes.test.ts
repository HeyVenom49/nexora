import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Server } from "node:http";
import { eq } from "drizzle-orm";
import { app } from "../../app";
import { db } from "../../db";
import { products } from "../../db/schema";
import {
  ProductRepository,
  type Product,
} from "../../modules/products/product.repository";
import { TokenService } from "../../security/token-service";

const repository = new ProductRepository(db);

let server: Server;
let baseUrl: string;
let product: Product;
let authHeaders: { Authorization: string };

beforeAll(async () => {
  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not start test server");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;

  // authenticate only verifies the JWT, so any user id works here.
  const accessToken = await new TokenService().generateAccessToken(
    crypto.randomUUID(),
  );
  authHeaders = { Authorization: `Bearer ${accessToken}` };

  product = await repository.create({
    name: "Routes Test Keyboard",
    slug: `routes-test-${crypto.randomUUID()}`,
    description: "Product routes integration test",
  });
});

afterAll(async () => {
  server.close();

  if (product) {
    await db.delete(products).where(eq(products.id, product.id));
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
