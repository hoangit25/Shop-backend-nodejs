import { BaseRepository } from '../../common/base.repository';
import { PermissionModel, IPermission } from './permission.model';

export class PermissionRepository extends BaseRepository<IPermission> {
  constructor() {
    super(PermissionModel);
  }

  async findByCode(code: string) {
    return this.findOne({
      code,
      deleted: false,
      isActive: true,
    });
  }

  async findManyByCodes(codes: string[]) {
    return this.find({
      code: {
        $in: codes,
      },
      deleted: false,
      isActive: true,
    });
  }
}

export const permissionRepository = new PermissionRepository();
