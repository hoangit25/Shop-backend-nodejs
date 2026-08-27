import { RoleModel, RoleScope } from '../role.model';
import { PermissionModel } from '../../permission/permission.model';

export async function seedRoles() {
  console.log('🌱 Seeding roles...');

  const permissions = await PermissionModel.find({
    deleted: false,
  });

  const permissionIds = permissions.map((p) => p._id);

  await RoleModel.updateOne(
    {
      slug: 'super-admin',
    },
    {
      $set: {
        name: 'Super Admin',
        slug: 'super-admin',
        scope: RoleScope.SYSTEM,
        permissions: permissionIds,
        isSystem: true,
        isActive: true,
        deleted: false,
      },
    },
    {
      upsert: true,
    }
  );

  console.log('✅ Role Seed Done');
}
