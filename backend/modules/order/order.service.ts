import { AppError } from '../../common/AppError';
import { Types } from 'mongoose';
import { orderRepository } from './order.repository';
import { OrderStatus } from './order.model';
import { inventoryRepository } from '../product/repositories/inventory.repository';
import { voucherService } from '../voucher/voucher.service';

export class OrderService {
  async create(payload: any) {
    return orderRepository.create(payload);
  }

  async checkout(payload: any, customerId: string) {
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
  }

  async getById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order || (order as any).deleted) {
      throw new AppError(404, 'Order not found.');
    }
    return order;
  }

  async getAll(query: any = {}) {
    const filter: any = { deleted: false };
    if (query.customer) {
      filter.customer = new Types.ObjectId(query.customer);
    }
    if (query.status) {
      filter.status = query.status;
    }
    return orderRepository.find(filter);
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

  async cancel(id: string) {
    const order = await this.getById(id);
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
