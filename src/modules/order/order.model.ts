import { Schema, Types, model, Document } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export interface IOrderItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId | null;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customer: Types.ObjectId;
  products: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  voucher?: Types.ObjectId | null;
  voucherCode?: string | null;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: OrderStatus;
  isActive: boolean;
  deleted: boolean;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
}

const orderItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    products: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: any[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must include at least one product.',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    voucher: {
      type: Types.ObjectId,
      ref: 'Voucher',
      default: null,
    },
    voucherCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'cod',
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
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

export const OrderModel = model<IOrder>('Order', orderSchema, 'Orders');
