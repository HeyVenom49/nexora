import { PermissionRepository } from "./permission.repository";

export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  public async hasPermission(
    userId: string,
    permissionKey: string,
  ): Promise<boolean> {
    const permissionKeys =
      await this.permissionRepository.findKeysByUserId(userId);

    return permissionKeys.includes(permissionKey);
  }
}
