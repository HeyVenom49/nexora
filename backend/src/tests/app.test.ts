import { beforeAll, afterAll, test, expect } from "bun:test";
import type { Server } from "node:http";
import { app } from "../app";

let server: Server;
let baseUrl: string;

beforeAll(() => {
  server = app.listen(0);

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not start test server");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => {
  server.close();
});

test("health endpoint returns 200", async () => {
  const response = await fetch(`${baseUrl}/health`);

  expect(response.status).toBe(200);
});

test("GET /api/users/me rejects requests without a token", async () => {
  const response = await fetch(`${baseUrl}/api/users/me`);

  expect(response.status).toBe(401);

  const body = await response.json();

  expect(body.success).toBe(false);
  expect(body.error.code).toBe("TOKEN_MISSING");
});

test("GET /api/users/me rejects an invalid token", async () => {
  const response = await fetch(`${baseUrl}/api/users/me`, {
    headers: {
      Authorization: "Bearer fake.invalid.token",
    },
  });

  expect(response.status).toBe(401);

  const body = await response.json();

  expect(body.success).toBe(false);
  expect(body.error.code).toBe("INVALID_TOKEN");
});

test("user can register, login, and access their profile", async () => {
  const email = `test-${crypto.randomUUID()}@example.com`;
  const password = "TestPassword123!";

  // 1. Register a test user
  const registerResponse = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  expect(registerResponse.status).toBe(201);

  // 2. Login with the newly registered user
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  expect(loginResponse.status).toBe(200);

  const loginBody = await loginResponse.json();
  const accessToken = loginBody.data.accessToken;

  expect(typeof accessToken).toBe("string");
  expect(accessToken.length).toBeGreaterThan(0);

  // 3. Access protected profile endpoint
  const profileResponse = await fetch(`${baseUrl}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  expect(profileResponse.status).toBe(200);

  const profileBody = await profileResponse.json();

  expect(profileBody.data.email).toBe(email);
  expect(profileBody.data).not.toHaveProperty("passwordHash");
});

test("user cannot access another user's profile", async () => {
  const password = "TestPassword123!";

  const userAEmail = `user-a-${crypto.randomUUID()}@example.com`;
  const userBEmail = `user-b-${crypto.randomUUID()}@example.com`;

  // Register User A
  const userARegisterResponse = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userAEmail,
      password,
    }),
  });
  expect(userARegisterResponse.status).toBe(201);

  // Register User B
  const userBRegisterResponse = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userBEmail,
      password,
    }),
  });
  expect(userBRegisterResponse.status).toBe(201);

  const userBBody = await userBRegisterResponse.json();
  const userBId = userBBody.data.id;

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userAEmail,
      password,
    }),
  });
  expect(loginResponse.status).toBe(200);

  const loginBody = await loginResponse.json();
  const userAToken = loginBody.data.accessToken;

  const profileResponse = await fetch(`${baseUrl}/api/users/${userBId}`, {
    headers: {
      Authorization: `Bearer ${userAToken}`,
    },
  });
  expect(profileResponse.status).toBe(403);
});
