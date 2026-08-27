import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { PermissionService, permissionService } from './permission.service';

export class PermissionController {
  constructor(private service: PermissionService = permissionService) {}

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await this.service.getAll();
    return ApiResponse.success(res, permissions);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const permission = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, permission);
  });

  getByModule = asyncHandler(async (req: Request, res: Response) => {
    const permissions = await this.service.getByModule(req.params.module as string);
    return ApiResponse.success(res, permissions);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const permission = await this.service.update(req.params.id as string, req.body);
    return ApiResponse.success(res, permission, 'Permission updated successfully.');
  });
}

export const permissionController = new PermissionController();
