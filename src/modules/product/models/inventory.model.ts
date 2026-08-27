import { Schema, Types, model, Document } from 'mongoose';

export interface IInventory extends Document {
  variant: Types.ObjectId;
  warehouse?: Types.ObjectId | null;
  onHand: number;
  reserved: number;
  incoming: number;
  damaged: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  deleted: boolean;
}

const inventorySchema = new Schema(
  {
    variant: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      unique: true,
      index: true,
    },
    warehouse: {
      type: Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true,
    },
    onHand: {
      type: Number,
      default: 0,
      min: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    incoming: {
      type: Number,
      default: 0,
      min: 0,
    },
    damaged: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    allowBackorder: {
      type: Boolean,
      default: false,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventorySchema.virtual('available').get(function (this: IInventory) {
  return Math.max(0, this.onHand - this.reserved);
});

inventorySchema.virtual('isLowStock').get(function (this: IInventory) {
  return this.onHand - this.reserved <= this.lowStockThreshold;
});

inventorySchema.virtual('isOutOfStock').get(function (this: IInventory) {
  return this.onHand - this.reserved <= 0;
});

inventorySchema.index({ warehouse: 1, variant: 1 });

export const InventoryModel = model<IInventory>('Inventory', inventorySchema);
