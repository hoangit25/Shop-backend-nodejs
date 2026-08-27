import { Schema, Types, model, Document } from 'mongoose';

export enum MediaOwnerType {
  PRODUCT = 'product',
  VARIANT = 'variant',
  CATEGORY = 'category',
  BRAND = 'brand',
  STORE = 'store',
  USER = 'user',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface IMedia extends Document {
  ownerType: MediaOwnerType;
  ownerId: Types.ObjectId;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  alt: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
  deleted: boolean;
  createdBy: Types.ObjectId | null;
}

const mediaSchema = new Schema(
  {
    ownerType: {
      type: String,
      enum: Object.values(MediaOwnerType),
      required: true,
      index: true,
    },
    ownerId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MediaType),
      default: MediaType.IMAGE,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mediaSchema.index({
  ownerType: 1,
  ownerId: 1,
});

mediaSchema.index({
  ownerType: 1,
  ownerId: 1,
  sortOrder: 1,
});

mediaSchema.index({
  ownerType: 1,
  ownerId: 1,
  isPrimary: 1,
});

mediaSchema.index({
  deleted: 1,
});

export const MediaModel = model<IMedia>('Media', mediaSchema);
