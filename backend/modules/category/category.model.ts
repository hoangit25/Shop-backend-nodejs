import { Schema, Types, model, Document } from 'mongoose';

export interface ICategory extends Document {
  parent: Types.ObjectId | null;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  deleted: boolean;
}

const categorySchema = new Schema(
  {
    parent: {
      type: Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
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
    description: {
      type: String,
      default: '',
    },
    image: {
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

categorySchema.index({
  parent: 1,
  sortOrder: 1,
});

categorySchema.index({
  deleted: 1,
  isActive: 1,
});

export const CategoryModel = model<ICategory>('Category', categorySchema);
