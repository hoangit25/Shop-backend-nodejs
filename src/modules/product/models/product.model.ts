import { Schema, Types, model, Document } from 'mongoose';

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
  ARCHIVED = 'archived',
}

export interface ISeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface IProduct extends Document {
  store: Types.ObjectId;
  category: Types.ObjectId;
  brand?: Types.ObjectId | null;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  seo: ISeo;
  tags: string[];
  weight: number;
  hasVariants: boolean;
  status: ProductStatus;
  isActive: boolean;
  deleted: boolean;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId | null;
  approvedAt?: Date | null;
  rejectedReason?: string;
}

const seoSchema = new Schema(
  {
    title: String,
    description: String,
    keywords: [String],
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    store: {
      type: Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    category: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: {
      type: Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    seo: {
      type: seoSchema,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    weight: {
      type: Number,
      default: 0,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ store: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ deleted: 1, isActive: 1 });

export const ProductModel = model<IProduct>('Product', productSchema);
