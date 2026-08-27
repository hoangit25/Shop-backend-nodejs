import { Schema, Types, model, Document } from 'mongoose';

export enum InventoryTransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RESERVE = 'reserve',
  RELEASE = 'release',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DAMAGE = 'damage',
  TRANSFER = 'transfer',
}

export interface IInventoryTransaction extends Document {
  inventory: Types.ObjectId;
  variant: Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: Types.ObjectId | null;
  note?: string;
  createdBy?: Types.ObjectId | null;
}

const inventoryTransactionSchema = new Schema(
  {
    inventory: {
      type: Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    variant: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(InventoryTransactionType),
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      default: null,
    },
    referenceId: {
      type: Types.ObjectId,
      default: null,
    },
    note: {
      type: String,
      default: '',
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

inventoryTransactionSchema.index({ inventory: 1, createdAt: -1 });
inventoryTransactionSchema.index({ variant: 1, createdAt: -1 });
inventoryTransactionSchema.index({ referenceType: 1, referenceId: 1 });

export const InventoryTransactionModel = model<IInventoryTransaction>(
  'InventoryTransaction',
  inventoryTransactionSchema
);
