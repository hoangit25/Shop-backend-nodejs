import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/AppError';
import UserModel from '../modules/user/user.model';

export const authorize =
  (...permissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?._id;

    if (!userId) {
      return next(new AppError(401, 'Unauthorized'));
    }

    const user = await UserModel.findById(userId)
      .populate({
        path: 'roles',
        match: {
          deleted: false,
          isActive: true,
        },
        populate: {
          path: 'permissions',
          match: {
            deleted: false,
            isActive: true,
          },
        },
      })
      .populate({
        path: 'permissionOverrides.permission',
        match: {
          deleted: false,
          isActive: true,
        },
      });

    if (!user) {
      return next(new AppError(401, 'User not found'));
    }

    const userPermissions = new Set<string>();

    const roles = (user.roles ?? []) as any[];
    for (const role of roles) {
      for (const permission of role.permissions ?? []) {
        if (permission.code) {
          userPermissions.add(permission.code);
        }
      }
    }

    for (const override of (user as any).permissionOverrides ?? []) {
      const perm = override.permission;
      if (perm?.code) {
        if (override.effect === 'DENY') {
          userPermissions.delete(perm.code);
        } else if (override.effect === 'ALLOW') {
          userPermissions.add(perm.code);
        }
      }
    }

    const allowed = permissions.every((permission) =>
      userPermissions.has(permission)
    );

    if (!allowed) {
      return next(new AppError(403, 'Permission denied'));
    }

    next();
  };
