import { Types } from 'mongoose';
import { AppError } from '../../common/AppError';
import { PermissionModel } from '../permission/permission.model';
import { RoleRepository, roleRepository } from './role.repository';

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export class RoleService {
  constructor(private repository: RoleRepository = roleRepository) {}

  async create(payload: any) {
    const slug = payload.slug || slugify(payload.name);
    const existed = await this.repository.findBySlug(slug);
    if (existed) {
      throw new AppError(409, 'Role slug already exists.');
    }

    if (payload.permissions && payload.permissions.length > 0) {
      const validPermissionsCount = await PermissionModel.countDocuments({
        _id: { $in: payload.permissions },
        deleted: false,
      });
      if (validPermissionsCount !== payload.permissions.length) {
        throw new AppError(400, 'One or more permissions do not exist.');
      }
    }

    const roleData = {
      ...payload,
      slug,
      permissions: (payload.permissions || []).map((id: string) => new Types.ObjectId(id)),
    };

    const createdRole = await this.repository.create(roleData);
    return this.repository.findByIdWithPermissions((createdRole as any)._id.toString());
  }

  async getAll(filter: any = {}) {
    return this.repository.findAllWithPermissions(filter);
  }

  async getById(id: string) {
    const role = await this.repository.findByIdWithPermissions(id);
    if (!role) {
      throw new AppError(404, 'Role not found.');
    }
    return role;
  }

  async getBySlug(slug: string) {
    const role = await this.repository.findBySlugWithPermissions(slug);
    if (!role) {
      throw new AppError(404, 'Role not found.');
    }
    return role;
  }

  async update(id: string, payload: any) {
    const role = await this.repository.findById(id);
    if (!role || (role as any).deleted) {
      throw new AppError(404, 'Role not found.');
    }

    if (payload.slug && payload.slug.toLowerCase() !== (role as any).slug) {
      const slugExists = await this.repository.findOne({
        slug: payload.slug.toLowerCase(),
        deleted: false,
        _id: { $ne: id },
      });
      if (slugExists) {
        throw new AppError(409, 'Role slug already exists.');
      }
    }

    if (payload.permissions && payload.permissions.length > 0) {
      const validPermissionsCount = await PermissionModel.countDocuments({
        _id: { $in: payload.permissions },
        deleted: false,
      });
      if (validPermissionsCount !== payload.permissions.length) {
        throw new AppError(400, 'One or more permissions do not exist.');
      }
    }

    const updateData = { ...payload };
    if (payload.permissions) {
      updateData.permissions = payload.permissions.map((pId: string) => new Types.ObjectId(pId));
    }

    await this.repository.updateById(id, updateData);
    return this.repository.findByIdWithPermissions(id);
  }

  async delete(id: string) {
    const role = await this.repository.findById(id);
    if (!role || (role as any).deleted) {
      throw new AppError(404, 'Role not found.');
    }

    if ((role as any).isSystem) {
      throw new AppError(400, 'Cannot delete system role.');
    }

    await this.repository.softDelete(id);
    return true;
  }
}

export const roleService = new RoleService();
