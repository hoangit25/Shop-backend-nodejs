import { Request, Response } from 'express';
import { roleService } from './role.service';

class RoleController {
  create = async (req: Request, res: Response) => {
    const role = await roleService.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Role created successfully.',
      data: role,
    });
  };

  getAll = async (req: Request, res: Response) => {
    const roles = await roleService.getAll(req.query);
    return res.json({
      success: true,
      data: roles,
    });
  };

  getById = async (req: Request, res: Response) => {
    const role = await roleService.getById(req.params.id as string);
    return res.json({
      success: true,
      data: role,
    });
  };

  getBySlug = async (req: Request, res: Response) => {
    const role = await roleService.getBySlug(req.params.slug as string);
    return res.json({
      success: true,
      data: role,
    });
  };

  update = async (req: Request, res: Response) => {
    const role = await roleService.update(req.params.id as string, req.body);
    return res.json({
      success: true,
      message: 'Role updated successfully.',
      data: role,
    });
  };

  delete = async (req: Request, res: Response) => {
    await roleService.delete(req.params.id as string);
    return res.json({
      success: true,
      message: 'Role deleted successfully.',
    });
  };
}

export const roleController = new RoleController();
