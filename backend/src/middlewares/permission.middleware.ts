import type { RequestHandler } from "express";
import { PermissionService } from "../modules/permissions/permission.service";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { ForbiddenError } from "../errors/forbidden-error";
import { PermissionRepository } from "../modules/permissions/permission.repository";
import { db } from "../db";

export const createRequirePermission =
  (permissionServer: Pick<PermissionService, "hasPermission">) =>
  (permissionKey: string): RequestHandler =>
  async (_req, res, next) => {
    try {
      const userId: unknown = res.locals.userId;

      if (typeof userId !== "string" || userId.length === 0) {
        throw new UnauthorizedError("Authentication required", "TOKEN_MISSING");
      }

      const allowed = await permissionServer.hasPermission(
        userId,
        permissionKey,
      );

      if (!allowed) {
        throw new ForbiddenError(
          "Insufficient permission",
          "INSUFFICIENT_PERMISSION",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const requirePermission = createRequirePermission(
  new PermissionService(new PermissionRepository(db)),
);
