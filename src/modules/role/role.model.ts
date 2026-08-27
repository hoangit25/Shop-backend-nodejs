import { Schema, Types, model, Document } from 'mongoose';

export enum RoleScope {
  SYSTEM = 'SYSTEM',
  STORE = 'STORE',
}

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  scope: RoleScope;
  permissions: Types.ObjectId[];
  isSystem: boolean;
  isActive: boolean;
  deleted: boolean;
}

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    scope: {
      type: String,
      enum: Object.values(RoleScope),
      required: true,
      default: RoleScope.SYSTEM,
      index: true,
    },
    permissions: [
      {
        type: Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

roleSchema.index({
  deleted: 1,
  isActive: 1,
});

roleSchema.virtual('permissionCount').get(function () {
  return this.permissions.length;
});

export const RoleModel = model<IRole>('Role', roleSchema);
