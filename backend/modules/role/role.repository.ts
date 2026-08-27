import { BaseRepository } from '../../common/base.repository';
import { RoleModel, IRole } from './role.model';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(RoleModel);
  }

  async findBySlug(slug: string) {
    return this.findOne({
      slug: slug.toLowerCase(),
      deleted: false,
    });
  }

  async findByName(name: string) {
    return this.findOne({
      name,
      deleted: false,
    });
  }

  async findByIdWithPermissions(id: string) {
    return RoleModel.findOne({
      _id: id,
      deleted: false,
    }).populate({
      path: 'permissions',
      match: { deleted: false, isActive: true },
      select: 'name code module description',
    });
  }

  async findBySlugWithPermissions(slug: string) {
    return RoleModel.findOne({
      slug: slug.toLowerCase(),
      deleted: false,
    }).populate({
      path: 'permissions',
      match: { deleted: false, isActive: true },
      select: 'name code module description',
    });
  }

  async findAllWithPermissions(filter: any = {}) {
    return RoleModel.find({ deleted: false, ...filter })
      .populate({
        path: 'permissions',
        match: { deleted: false, isActive: true },
        select: 'name code module description',
      })
      .sort({ createdAt: -1 });
  }
}

export const roleRepository = new RoleRepository();
