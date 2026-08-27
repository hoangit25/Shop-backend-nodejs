import { Schema, Types, model, Document } from 'mongoose';

export interface IStore extends Document {
  owner: Types.ObjectId;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  staffs: Array<{
    user: Types.ObjectId;
    roles: Types.ObjectId[];
    isActive: boolean;
  }>;
  productCount: number;
  followerCount: number;
  ratingAverage: number;
  ratingCount: number;
  isVerified: boolean;
  isActive: boolean;
  deleted: boolean;
}

const staffSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roles: [
      {
        type: Types.ObjectId,
        ref: 'Role',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const storeSchema = new Schema(
  {
    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
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
    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    staffs: {
      type: [staffSchema],
      default: [],
    },
    productCount: {
      type: Number,
      default: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
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

storeSchema.index({
  deleted: 1,
  isActive: 1,
});

storeSchema.virtual('staffCount').get(function () {
  return this.staffs.length;
});

export const StoreModel = model<IStore>('Store', storeSchema);
