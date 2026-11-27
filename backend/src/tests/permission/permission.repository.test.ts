import { afterAll, expect, test } from "bun:test";
import { inArray } from "drizzle-orm";
import { db } from "../../db";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "../../db/schema";
import { PermissionRepository } from "../../modules/permissions/permission.repository";

const repository = new PermissionRepository(db);

const createdUserIds: string[] = [];
const createdRoleIds: string[] = [];
const createdPermissionIds: string[] = [];

async function createUser() {
  const [user] = await db
    .insert(users)
    .values({
      email: `permission-test-${crypto.randomUUID()}@example.com`,
      passwordHash: "not-a-real-hash",
    })
    .returning({ id: users.id });

  if (!user) throw new Error("Failed to create test user");
  createdUserIds.push(user.id);

  return user.id;
}

async function createRole(permissionIds: string[]) {
  const [role] = await db
    .insert(roles)
    .values({ key: `test-role-${crypto.randomUUID()}` })
    .returning({ id: roles.id });

  if (!role) throw new Error("Failed to create test role");
  createdRoleIds.push(role.id);

  if (permissionIds.length > 0) {
    await db
      .insert(rolePermissions)
      .values(permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })));
  }

  return role.id;
}

async function createPermission() {
  const [permission] = await db
    .insert(permissions)
    .values({ key: `test:perm-${crypto.randomUUID()}` })
    .returning({ id: permissions.id, key: permissions.key });

  if (!permission) throw new Error("Failed to create test permission");
  createdPermissionIds.push(permission.id);

  return permission;
}

async function assignRoles(userId: string, roleIds: string[]) {
  await db
    .insert(userRoles)
    .values(roleIds.map((roleId) => ({ userId, roleId })));
}

afterAll(async () => {
  // Cascades remove user_roles and role_permissions rows.
  if (createdUserIds.length > 0) {
    await db.delete(users).where(inArray(users.id, createdUserIds));
  }
  if (createdRoleIds.length > 0) {
    await db.delete(roles).where(inArray(roles.id, createdRoleIds));
  }
  if (createdPermissionIds.length > 0) {
    await db
      .delete(permissions)
      .where(inArray(permissions.id, createdPermissionIds));
  }
});

test("returns an empty list for a user with no roles", async () => {
  const userId = await createUser();

  expect(await repository.findKeysByUserId(userId)).toEqual([]);
});

test("returns an empty list for an unknown user", async () => {
  expect(await repository.findKeysByUserId(crypto.randomUUID())).toEqual([]);
});

test("returns the permission keys granted by the user's role", async () => {
  const read = await createPermission();
  const write = await createPermission();
  const roleId = await createRole([read.id, write.id]);
  const userId = await createUser();
  await assignRoles(userId, [roleId]);

  const keys = await repository.findKeysByUserId(userId);

  expect(keys.sort()).toEqual([read.key, write.key].sort());
});

test("returns each key once when multiple roles grant the same permission", async () => {
  const shared = await createPermission();
  const extra = await createPermission();
  const roleA = await createRole([shared.id]);
  const roleB = await createRole([shared.id, extra.id]);
  const userId = await createUser();
  await assignRoles(userId, [roleA, roleB]);

  const keys = await repository.findKeysByUserId(userId);

  expect(keys).toHaveLength(2);
  expect(keys.sort()).toEqual([shared.key, extra.key].sort());
});

test("does not return permissions from roles the user does not have", async () => {
  const owned = await createPermission();
  const other = await createPermission();
  const ownedRole = await createRole([owned.id]);
  await createRole([other.id]);
  const userId = await createUser();
  await assignRoles(userId, [ownedRole]);

  expect(await repository.findKeysByUserId(userId)).toEqual([owned.key]);
});
