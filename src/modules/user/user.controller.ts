import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { AppError } from '../../common/AppError';
import { asyncHandler } from '../../common/async-handler';
import { UserService, userService } from './user.service';

export class UserController {
  constructor(private service: UserService = userService) {}

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    if (!userId) {
      throw AppError.Unauthorized('Unauthenticated');
    }
    const user = await this.service.getUserById(userId.toString());
    const userObj = user.toObject ? user.toObject() : user;
    delete (userObj as any).password;
    return ApiResponse.success(res, userObj);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = (req as any).user?._id;
    await this.service.updateUser(id, req.body);
    return ApiResponse.message(res, 'Cập nhật thông tin thành công.');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const id = (req as any).user?._id;
    const { oldPassword, newPassword } = req.body;
    const result = await this.service.changePassword(id, oldPassword, newPassword);
    return ApiResponse.success(res, result, 'Đổi mật khẩu thành công.');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getUserById(req.params.id as string);
    const userObj = user.toObject ? user.toObject() : user;
    delete (userObj as any).password;
    return ApiResponse.success(res, userObj);
  });

  listUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.service.listUsers();
    return ApiResponse.success(res, users);
  });

  assignRole = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.assignRole(req.params.id as string, req.body.role_id);
    return ApiResponse.success(res, user, 'Role assigned successfully.');
  });

  removeRole = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.removeRole(req.params.id as string, req.params.roleId as string);
    return ApiResponse.success(res, user, 'Role removed successfully.');
  });

  setPermissionOverride = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.setPermissionOverride(
      req.params.id as string,
      req.body.permission_id,
      req.body.effect
    );
    return ApiResponse.success(res, user, 'Permission override set successfully.');
  });

  removePermissionOverride = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.removePermissionOverride(
      req.params.id as string,
      req.params.permissionId as string
    );
    return ApiResponse.success(res, user, 'Permission override removed successfully.');
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.createUser(req.body);
    return ApiResponse.created(res, user, 'User created successfully.');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteUser(req.params.id as string);
    return ApiResponse.message(res, 'User deleted successfully.');
  });

  toggleBlock = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.toggleBlock(req.params.id as string);
    return ApiResponse.success(res, result);
  });
}

export const userController = new UserController();
export const getMe = userController.getMe;
export const updateUser = userController.updateUser;
export const changePassword = userController.changePassword;
export const getUserById = userController.getUserById;
export const listUsers = userController.listUsers;
export const assignRole = userController.assignRole;
export const removeRole = userController.removeRole;
export const setPermissionOverride = userController.setPermissionOverride;
export const removePermissionOverride = userController.removePermissionOverride;
export const createUser = userController.createUser;
export const deleteUser = userController.deleteUser;
export const toggleBlock = userController.toggleBlock;
