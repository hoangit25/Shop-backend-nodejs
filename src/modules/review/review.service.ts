import { AppError } from '../../common/AppError';
import { reviewRepository } from './review.repository';
import { orderRepository } from '../order/order.repository';
import { OrderStatus } from '../order/order.model';
import { Types } from 'mongoose';

export class ReviewService {
  async create(payload: any) {
    const userId = payload.user?.toString();
    const productId = payload.product?.toString();

    if (!userId || !productId) {
      throw new AppError(400, 'User and product are required for review.');
    }

    // 1. Duplicate review check
    const existingReview = await reviewRepository.findOne({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId),
      deleted: false,
    });

    if (existingReview) {
      throw new AppError(409, 'Bạn đã đánh giá sản phẩm này rồi.');
    }

    // 2. Purchased product check (user must have a COMPLETED order containing this product)
    const hasPurchased = await orderRepository.findOne({
      customer: new Types.ObjectId(userId),
      status: OrderStatus.COMPLETED,
      'products.product': new Types.ObjectId(productId),
      deleted: false,
    });

    if (!hasPurchased) {
      throw new AppError(403, 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng thành công.');
    }

    return reviewRepository.create(payload);
  }

  async getById(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review || (review as any).deleted) {
      throw new AppError(404, 'Review not found.');
    }
    return review;
  }

  async getAll() {
    return reviewRepository.find({ deleted: false });
  }

  async update(id: string, payload: any, userId: string) {
    const review = await this.getById(id);
    if ((review as any).user.toString() !== userId) {
      throw new AppError(403, 'You may only update your own review.');
    }
    Object.assign(review, payload);
    await (review as any).save();
    return review;
  }

  async delete(id: string, userId: string) {
    const review = await this.getById(id);
    if ((review as any).user.toString() !== userId) {
      throw new AppError(403, 'You may only delete your own review.');
    }
    (review as any).deleted = true;
    (review as any).isActive = false;
    await (review as any).save();
    return review;
  }
}

export const reviewService = new ReviewService();
