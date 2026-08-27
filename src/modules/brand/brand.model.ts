import { Schema, model, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  website: string | null;
  country: string | null;
  sortOrder: number;
  isActive: boolean;
  deleted: boolean;
}

const brandSchema = new Schema(
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
    logo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

brandSchema.index({
  deleted: 1,
  isActive: 1,
});

export const BrandModel = model<IBrand>('Brand', brandSchema);
