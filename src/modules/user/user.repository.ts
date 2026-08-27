import { Types } from 'mongoose';
import { BaseRepository } from '../../common/base.repository';
import UserModel, { IUser } from './user.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async findByIdActive(id: string) {
    return this.findOne({ _id: id, deleted: false });
  }

  async findByIdWithRolesAndOverrides(id: string) {
    return UserModel.findOne({ _id: id, deleted: false })
      .populate({
        path: 'roles',
        match: { deleted: false, isActive: true },
        populate: {
          path: 'permissions',
          match: { deleted: false, isActive: true },
          select: 'code name module description',
        },
      })
      .populate({
        path: 'permissionOverrides.permission',
        match: { deleted: false, isActive: true },
        select: 'code name module description',
      });
  }

  async listActiveUsers() {
    return this.find({ deleted: false });
  }

  async updateUserFields(id: string, userData: any) {
    return UserModel.updateOne({ _id: id, deleted: false }, { $set: userData });
  }

  async addRole(userId: string, roleId: string) {
    return UserModel.updateOne(
      { _id: userId, deleted: false },
      { $addToSet: { roles: new Types.ObjectId(roleId) } }
    );
  }

  async removeRole(userId: string, roleId: string) {
    return UserModel.updateOne(
      { _id: userId, deleted: false },
      { $pull: { roles: new Types.ObjectId(roleId) } }
    );
  }

  async setPermissionOverride(userId: string, permissionId: string, effect: string) {
    return UserModel.updateOne(
      { _id: userId, deleted: false },
      {
        $pull: {
          permissionOverrides: {
            permission: new Types.ObjectId(permissionId),
          },
        },
        $push: {
          permissionOverrides: {
            permission: new Types.ObjectId(permissionId),
            effect,
          },
        },
      }
    );
  }

  async removePermissionOverride(userId: string, permissionId: string) {
    return UserModel.updateOne(
      { _id: userId, deleted: false },
      {
        $pull: {
          permissionOverrides: {
            permission: new Types.ObjectId(permissionId),
          },
        },
      }
    );
  }
}

export const userRepository = new UserRepository();
export const UserRepositorySingleton = userRepository;
