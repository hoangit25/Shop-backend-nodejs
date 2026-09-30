import { AppError } from '../../common/AppError';
import { Types } from 'mongoose';
import { orderRepository } from './order.repository';
import { OrderStatus } from './order.model';
import { inventoryRepository } from '../product/repositories/inventory.repository';
import { voucherService } from '../voucher/voucher.service';

import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';

export class OrderService {
  async create(payload: any) {
    return orderRepository.create(payload);
  }

  async checkout(payload: CreateOrderDto, customerId: string) {
    const products = payload.products ?? [];
    if (!Array.isArray(products) || products.length === 0) {
      throw new AppError(400, 'Order must include at least one product.');
    }

    const subtotal = products.reduce((total: number, item: any) => {
      return total + item.price * item.quantity;
    }, 0);

    let discountAmount = 0;
    let voucher: any = null;
    if (payload.voucherCode) {
      const redemption = await voucherService.redeem(payload.voucherCode, subtotal);
      discountAmount = redemption.discountAmount;
      voucher = redemption.voucher;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const normalizedProducts = products.map((item: any) => ({
      product: item.product ? new Types.ObjectId(item.product) : undefined,
      variant: item.variant ? new Types.ObjectId(item.variant) : undefined,
      quantity: item.quantity,
      price: item.price,
    }));

    const reservedVariants: Array<{ variantId: string; quantity: number }> = [];

    try {
      for (const item of normalizedProducts) {
        if (!item.variant) {
          continue;
        }
        const inventory = await inventoryRepository.reserve(
          item.variant.toString(),
          item.quantity
        );
        if (!inventory) {
          throw new AppError(400, `Insufficient stock for variant ${item.variant}`);
        }
        reservedVariants.push({ variantId: item.variant.toString(), quantity: item.quantity });
      }

      const orderPayload = {
        customer: new Types.ObjectId(customerId),
        products: normalizedProducts,
        subtotal,
        discountAmount,
        voucher: voucher?._id ?? null,
        voucherCode: voucher?.code ?? payload.voucherCode ?? null,
        totalAmount,
        shippingAddress: payload.shippingAddress ?? '',
        paymentMethod: payload.paymentMethod ?? 'cod',
        status: OrderStatus.PENDING,
        createdBy: new Types.ObjectId(customerId),
        updatedBy: new Types.ObjectId(customerId),
      };

      const createdOrder = await orderRepository.create(orderPayload as any);

      if (voucher && voucher._id) {
        await voucherService.incrementUsedCount(voucher._id.toString());
      }

      return createdOrder;
    } catch (error) {
      // Rollback any successfully reserved variants upon failure
      for (const reserved of reservedVariants) {
        await inventoryRepository.release(reserved.variantId, reserved.quantity);
      }
      throw error;
    }
  }

  async getById(id: string, customerId?: string, isStaffOrAdmin: boolean = false) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid Order ID.');
    }

    const order = await (orderRepository as any).model
      .findOne({ _id: id, deleted: false })
      .populate('customer', 'fullName email phone')
      .populate('products.product', 'name slug')
      .populate('products.variant', 'sku price options')
      .populate('voucher', 'code discountType discountValue');

    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    if (customerId && !isStaffOrAdmin && order.customer?._id?.toString() !== customerId) {
      throw new AppError(403, 'You are not authorized to view this order.');
    }

    return order;
  }

  async getMyOrders(customerId: string) {
    return (orderRepository as any).model
      .find({ customer: new Types.ObjectId(customerId), deleted: false })
      .sort({ createdAt: -1 })
      .populate('products.product', 'name slug')
      .populate('products.variant', 'sku price options');
  }

  async getAll(query: any = {}) {
    const filter: any = { deleted: false };
    if (query.customer && Types.ObjectId.isValid(query.customer)) {
      filter.customer = new Types.ObjectId(query.customer);
    }
    if (query.status) {
      filter.status = query.status;
    }
    return (orderRepository as any).model
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('customer', 'fullName email phone')
      .populate('products.product', 'name slug')
      .populate('products.variant', 'sku price options');
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.getById(id);
    if (
      (order as any).status === OrderStatus.CANCELED ||
      (order as any).status === OrderStatus.COMPLETED
    ) {
      throw new AppError(400, 'Cannot update status for completed or canceled orders.');
    }
    (order as any).status = status;
    await (order as any).save();
    return order;
  }

  async cancel(id: string, customerId?: string, isStaffOrAdmin: boolean = false) {
    const order = await this.getById(id, customerId, isStaffOrAdmin);
    if (
      (order as any).status === OrderStatus.CANCELED ||
      (order as any).status === OrderStatus.COMPLETED
    ) {
      throw new AppError(400, 'Cannot cancel a completed or canceled order.');
    }

    for (const item of (order as any).products ?? []) {
      if (!item.variant) {
        continue;
      }
      await inventoryRepository.release(item.variant.toString(), item.quantity);
    }

    if ((order as any).voucher) {
      await voucherService.decrementUsedCount((order as any).voucher.toString());
    }

    (order as any).status = OrderStatus.CANCELED;
    await (order as any).save();
    return order;
  }

  async confirm(id: string) {
    return this.updateStatus(id, OrderStatus.CONFIRMED);
  }

  async ship(id: string) {
    return this.updateStatus(id, OrderStatus.SHIPPING);
  }

  async complete(id: string) {
    const order = await this.getById(id);
    if (
      (order as any).status === OrderStatus.CANCELED ||
      (order as any).status === OrderStatus.COMPLETED
    ) {
      throw new AppError(400, 'Cannot complete a canceled or already completed order.');
    }

    for (const item of (order as any).products ?? []) {
      if (!item.variant) {
        continue;
      }
      await inventoryRepository.updateInventory(item.variant.toString(), {
        $inc: {
          onHand: -item.quantity,
          reserved: -item.quantity,
        },
      });
    }

    (order as any).status = OrderStatus.COMPLETED;
    await (order as any).save();
    return order;
  }
}

export const orderService = new OrderService();
