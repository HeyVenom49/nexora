import { afterEach, expect, mock, test } from "bun:test";
import { PermissionRepository } from "../../modules/permissions/permission.repository";
import { PermissionService } from "../../modules/permissions/permission.service";

const userId = "7d0f4c2e-3b1a-4c5d-9e8f-0a1b2c3d4e5f";

function createService(keys: string[]) {
  const repository = {
    findKeysByUserId: mock(async (_userId: string): Promise<string[]> => keys),
  };

  const service = new PermissionService(
    repository as unknown as PermissionRepository,
  );

  return { service, repository };
}

afterEach(() => {
  mock.restore();
});

test("returns true when the user has the permission", async () => {
  const { service } = createService(["product:read", "product:create"]);

  expect(await service.hasPermission(userId, "product:create")).toBe(true);
});

test("returns false when the user lacks the permission", async () => {
  const { service } = createService(["product:read"]);

  expect(await service.hasPermission(userId, "product:create")).toBe(false);
});

test("returns false when the user has no permissions", async () => {
  const { service } = createService([]);

  expect(await service.hasPermission(userId, "product:read")).toBe(false);
});

test("matches permission keys exactly, not by substring", async () => {
  const { service } = createService(["product:read"]);

  expect(await service.hasPermission(userId, "product:re")).toBe(false);
  expect(await service.hasPermission(userId, "product:read:extra")).toBe(false);
});

test("loads permissions for the given user once per check", async () => {
  const { service, repository } = createService(["product:read"]);

  await service.hasPermission(userId, "product:read");

  expect(repository.findKeysByUserId).toHaveBeenCalledTimes(1);
  expect(repository.findKeysByUserId).toHaveBeenCalledWith(userId);
});
