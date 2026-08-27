import { AppError } from '../../common/AppError';
import { PermissionRepository, permissionRepository } from './permission.repository';

export class PermissionService {
  constructor(private repository: PermissionRepository = permissionRepository) {}

  async getAll(filter: any = {}) {
    return this.repository.find(
      { deleted: false, ...filter },
      undefined,
      { sort: { module: 1, code: 1 }, lean: true }
    );
  }

  async getById(id: string) {
    const permission = await this.repository.findOne({ _id: id, deleted: false });
    if (!permission) {
      throw AppError.NotFound('Permission not found.', 'PERMISSION_NOT_FOUND');
    }
    return permission;
  }

  async getByModule(module: string) {
    return this.repository.find(
      { module, deleted: false, isActive: true },
      undefined,
      { sort: { code: 1 }, lean: true }
    );
  }

  async getByCode(code: string) {
    const permission = await this.repository.findByCode(code);
    if (!permission) {
      throw AppError.NotFound('Permission not found.', 'PERMISSION_NOT_FOUND');
    }
    return permission;
  }

  async update(id: string, payload: { name?: string; description?: string; isActive?: boolean }) {
    const permission = await this.getById(id);

    if (permission.isSystem) {
      // System permissions: only allow updating name, description
      if (payload.isActive !== undefined) {
        throw AppError.BadRequest(
          'Cannot change active status of system permissions.',
          'SYSTEM_PERMISSION'
        );
      }
    }

    Object.assign(permission, payload);
    await permission.save();
    return permission;
  }
}

export const permissionService = new PermissionService();
