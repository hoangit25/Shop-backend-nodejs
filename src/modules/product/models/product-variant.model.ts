import { Schema, Types, model, Document } from 'mongoose';

export enum ProductVariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IOptionSnapshot {
  attributeId: Types.ObjectId;
  attributeName: string;
  attributeValueId: Types.ObjectId;
  attributeValue: string;
}

export interface IProductVariant extends Document {
  product: Types.ObjectId;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  options: IOptionSnapshot[];
  isDefault: boolean;
  status: ProductVariantStatus;
  deleted: boolean;
}

const optionSnapshotSchema = new Schema(
  {
    attributeId: {
      type: Types.ObjectId,
      ref: 'Attribute',
      required: true,
    },
    attributeName: {
      type: String,
      required: true,
      trim: true,
    },
    attributeValueId: {
      type: Types.ObjectId,
      ref: 'AttributeValue',
      required: true,
    },
    attributeValue: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productVariantSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    barcode: {
      type: String,
      default: null,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    length: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    options: {
      type: [optionSnapshotSchema],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(ProductVariantStatus),
      default: ProductVariantStatus.ACTIVE,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productVariantSchema.index({ product: 1, sku: 1 }, { unique: true });
productVariantSchema.index({ product: 1, status: 1 });

export const ProductVariantModel = model<IProductVariant>('ProductVariant', productVariantSchema);
