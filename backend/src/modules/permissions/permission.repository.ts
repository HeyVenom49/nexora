import { eq } from "drizzle-orm";
import { db } from "../../db";
import { permissions, rolePermissions, userRoles } from "../../db/schema";

export class PermissionRepository {
  constructor(private readonly database: typeof db) {}

  public async findKeysByUserId(userId: string): Promise<string[]> {
    const rows = await this.database
      .selectDistinct({
        permissionKey: permissions.key,
      })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    return rows.map((row) => row.permissionKey);
  }
}
