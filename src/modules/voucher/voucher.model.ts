import { Schema, Types, model, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  description: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  deleted: boolean;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
}

const voucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percent', 'amount'],
      default: 'amount',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
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
    updatedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const VoucherModel = model<IVoucher>('Voucher', voucherSchema, 'Vouchers');
