import { Schema, Types, model, Document } from 'mongoose';

export interface IProductOption extends Document {
  product: Types.ObjectId;
  attribute: Types.ObjectId;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  deleted: boolean;
}

const productOptionSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    attribute: {
      type: Types.ObjectId,
      ref: 'Attribute',
      required: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isRequired: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productOptionSchema.index({ product: 1, attribute: 1 }, { unique: true });
productOptionSchema.index({ product: 1, sortOrder: 1 });

export const ProductOptionModel = model<IProductOption>('ProductOption', productOptionSchema);
