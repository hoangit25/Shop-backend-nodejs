import { PermissionModel } from '../permission.model';
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from '../../../constants/permissions';

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  for (const permissionCode of ALL_PERMISSIONS) {
    const module = Object.entries(PERMISSION_GROUPS).find(([, permissions]) =>
      permissions.includes(permissionCode)
    )?.[0];

    await PermissionModel.updateOne(
      {
        code: permissionCode,
      },
      {
        $set: {
          code: permissionCode,
          module,
          name: permissionCode
            .split(':')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          description: permissionCode,
          isSystem: true,
          isActive: true,
          deleted: false,
        },
      },
      {
        upsert: true,
      }
    );
  }

  console.log('✅ Permission Seed Done');
}
