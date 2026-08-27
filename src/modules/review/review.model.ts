import { Schema, Types, model, Document } from 'mongoose';

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  isActive: boolean;
  deleted: boolean;
  createdBy?: Types.ObjectId | null;
}

const reviewSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel = model<IReview>('Review', reviewSchema, 'Reviews');
