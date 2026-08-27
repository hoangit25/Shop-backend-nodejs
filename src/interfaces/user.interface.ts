import { Document, Types } from 'mongoose';

export enum UserRoleCode {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  permissionOverrides: Array<{
    permission: Types.ObjectId;
    effect: 'ALLOW' | 'DENY';
  }>;
  isEmailVerified: boolean;
  roles: Types.ObjectId[];
  isActive: boolean;
  deleted: boolean;
  deletedAt: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
