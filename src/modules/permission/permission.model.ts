import { Schema, model, Document } from 'mongoose';
import { PermissionModule } from '../../constants/permissions';

export interface IPermission extends Document {
  code: string;
  name: string;
  module: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  deleted: boolean;
}

const permissionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      enum: Object.values(PermissionModule),
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    isSystem: {
      type: Boolean,
      default: true,
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

permissionSchema.index({
  module: 1,
  code: 1,
});

permissionSchema.index({
  deleted: 1,
  isActive: 1,
});

export const PermissionModel = model<IPermission>('Permission', permissionSchema);
