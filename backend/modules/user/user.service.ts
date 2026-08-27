import { Types } from 'mongoose';
import { AppError } from '../../common/AppError';
import { PermissionModel } from '../permission/permission.model';
import { RoleModel } from '../role/role.model';
import { UserRepository, userRepository } from './user.repository';
import UserModel from './user.model';

const ALLOWED_UPDATE_FIELDS = ['fullName', 'phone', 'avatar'];

export class UserService {
  constructor(private repository: UserRepository = userRepository) {}

  async updateUser(id: string, userData: any) {
    const sanitized: Record<string, any> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (userData[key] !== undefined) {
        sanitized[key] = userData[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw AppError.BadRequest('No valid fields to update', 'NO_UPDATE_FIELDS');
    }

    return this.repository.updateUserFields(id, sanitized);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await UserModel.findOne({ _id: userId, deleted: false });
    if (!user) {
      throw AppError.NotFound('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw AppError.BadRequest('Mật khẩu hiện tại không đúng.', 'INVALID_OLD_PASSWORD');
    }

    user.password = newPassword;
    await user.save();
    return { message: 'Đổi mật khẩu thành công.' };
  }

  async getUserById(id: string) {
    const user = await this.repository.findByIdWithRolesAndOverrides(id);
    if (!user) {
      throw AppError.NotFound('User not found', 'USER_NOT_FOUND');
    }
    return user;
  }

  async listUsers() {
    return this.repository.listActiveUsers();
  }

  async assignRole(userId: string, roleId: string) {
    if (!Types.ObjectId.isValid(roleId)) {
      throw AppError.BadRequest('Invalid Role ID.', 'INVALID_ID');
    }

    const role = await RoleModel.findOne({
      _id: roleId,
      deleted: false,
      isActive: true,
    });

    if (!role) {
      throw AppError.NotFound('Role not found.', 'ROLE_NOT_FOUND');
    }

    await this.repository.addRole(userId, roleId);
    return this.getUserById(userId);
  }

  async removeRole(userId: string, roleId: string) {
    if (!Types.ObjectId.isValid(roleId)) {
      throw AppError.BadRequest('Invalid Role ID.', 'INVALID_ID');
    }

    const role = await RoleModel.findOne({ _id: roleId, deleted: false });
    if (!role) {
      throw AppError.NotFound('Role not found.', 'ROLE_NOT_FOUND');
    }

    await this.repository.removeRole(userId, roleId);
    return this.getUserById(userId);
  }

  async setPermissionOverride(userId: string, permissionId: string, effect: string) {
    if (!Types.ObjectId.isValid(permissionId)) {
      throw AppError.BadRequest('Invalid Permission ID.', 'INVALID_ID');
    }

    const permission = await PermissionModel.findOne({
      _id: permissionId,
      deleted: false,
      isActive: true,
    });

    if (!permission) {
      throw AppError.NotFound('Permission not found.', 'PERMISSION_NOT_FOUND');
    }

    await this.repository.setPermissionOverride(userId, permissionId, effect);
    return this.getUserById(userId);
  }

  async removePermissionOverride(userId: string, permissionId: string) {
    if (!Types.ObjectId.isValid(permissionId)) {
      throw AppError.BadRequest('Invalid Permission ID.', 'INVALID_ID');
    }

    await this.repository.removePermissionOverride(userId, permissionId);
    return this.getUserById(userId);
  }
}

export const userService = new UserService();
export const updateUser = (id: string, userData: any) => userService.updateUser(id, userData);
export const changePassword = (userId: string, oldPassword: string, newPassword: string) =>
  userService.changePassword(userId, oldPassword, newPassword);
export const getUserById = (id: string) => userService.getUserById(id);
export const listUsers = () => userService.listUsers();
export const assignRole = (userId: string, roleId: string) => userService.assignRole(userId, roleId);
export const removeRole = (userId: string, roleId: string) => userService.removeRole(userId, roleId);
export const setPermissionOverride = (userId: string, permissionId: string, effect: string) =>
  userService.setPermissionOverride(userId, permissionId, effect);
export const removePermissionOverride = (userId: string, permissionId: string) =>
  userService.removePermissionOverride(userId, permissionId);
