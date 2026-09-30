import mongoose from 'mongoose';
import 'dotenv/config';
import { seedPermissions } from '../modules/permission/seeds/permission.seed';
import { seedRoles } from '../modules/role/seeds/role.seed';
import { seedSuperAdmin } from '../modules/user/seeds/user.seed';

async function runSeed() {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI || '';
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is missing.');
    }

    await mongoose.connect(mongoUrl);
    console.log('MongoDB Connected');

    await seedPermissions();
    await seedRoles();
    await seedSuperAdmin();

    console.log('Seed Completed');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

runSeed();
