import UserModel from '../user.model';
import { RoleModel } from '../../role/role.model';

export async function seedSuperAdmin() {
  console.log('🌱 Seeding Super Admin user...');

  const superAdminRole = await RoleModel.findOne({ slug: 'super-admin', deleted: false });
  if (!superAdminRole) {
    console.warn('⚠️ Super admin role not found. Skipping super admin user seed.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shop.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    await UserModel.create({
      fullName: 'Super Administrator',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      phone: '0901234567',
      roles: [superAdminRole._id],
      isEmailVerified: true,
      isActive: true,
      deleted: false,
    });
    console.log(`✅ Super Admin created with email: ${adminEmail}`);
  } else {
    // Ensure admin has the super-admin role
    if (!existingAdmin.roles.some((r) => r.toString() === superAdminRole._id.toString())) {
      existingAdmin.roles.push(superAdminRole._id);
      await existingAdmin.save();
    }
    console.log(`ℹ️ Super Admin already exists (${adminEmail})`);
  }
}
