import { AppError } from '../../common/AppError';
import { voucherRepository } from './voucher.repository';

export class VoucherService {
  async create(payload: any) {
    const existing = await voucherRepository.findByCode(payload.code.toUpperCase());
    if (existing) {
      throw new AppError(409, 'Voucher code already exists.');
    }
    return voucherRepository.create({
      ...payload,
      code: payload.code.toUpperCase(),
    });
  }

  async getById(id: string) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher || (voucher as any).deleted) {
      throw new AppError(404, 'Voucher not found.');
    }
    return voucher;
  }

  async getAll() {
    return voucherRepository.find({ deleted: false });
  }

  async redeem(code: string, orderSubtotal: number) {
    const voucher = await voucherRepository.findByCode(code.toUpperCase());
    if (!voucher || (voucher as any).deleted || !(voucher as any).isActive) {
      throw new AppError(404, 'Mã giảm giá không tồn tại hoặc không khả dụng.');
    }

    const now = new Date();
    if ((voucher as any).startDate && (voucher as any).startDate > now) {
      throw new AppError(400, 'Mã giảm giá chưa đến thời gian áp dụng.');
    }
    if ((voucher as any).endDate < now) {
      throw new AppError(400, 'Mã giảm giá đã hết hạn.');
    }

    if (
      (voucher as any).usageLimit != null &&
      (voucher as any).usedCount >= (voucher as any).usageLimit
    ) {
      throw new AppError(400, 'Mã giảm giá đã hết lượt sử dụng.');
    }

    if (
      (voucher as any).minOrderValue &&
      orderSubtotal < (voucher as any).minOrderValue
    ) {
      throw new AppError(
        400,
        `Đơn hàng phải tối thiểu ${(voucher as any).minOrderValue} để sử dụng mã này.`
      );
    }

    let discountAmount = 0;
    if ((voucher as any).discountType === 'percent') {
      discountAmount = (orderSubtotal * (voucher as any).discountValue) / 100;
      if (
        (voucher as any).maxDiscountAmount != null &&
        (voucher as any).maxDiscountAmount > 0
      ) {
        discountAmount = Math.min(discountAmount, (voucher as any).maxDiscountAmount);
      }
    } else {
      discountAmount = (voucher as any).discountValue;
    }

    discountAmount = Math.min(discountAmount, orderSubtotal);

    return {
      voucher,
      discountAmount,
    };
  }

  async incrementUsedCount(voucherId: string) {
    const voucher = await this.getById(voucherId);
    (voucher as any).usedCount = ((voucher as any).usedCount || 0) + 1;
    await (voucher as any).save();
    return voucher;
  }

  async update(id: string, payload: any) {
    const voucher = await this.getById(id);
    Object.assign(voucher, payload);
    await (voucher as any).save();
    return voucher;
  }

  async delete(id: string) {
    const voucher = await this.getById(id);
    (voucher as any).deleted = true;
    (voucher as any).isActive = false;
    await (voucher as any).save();
    return voucher;
  }
}

export const voucherService = new VoucherService();
