import { z } from 'zod';

export const createVoucherSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1),
    description: z.string().optional(),
    discountType: z.enum(['percent', 'amount']),
    discountValue: z.number().min(0),
    maxDiscountAmount: z.number().min(0).optional(),
    minOrderValue: z.number().min(0).optional(),
    usageLimit: z.number().min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime(),
    isActive: z.boolean().optional(),
  }),
});

export const updateVoucherSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid voucher id'),
  }),
  body: z.object({
    description: z.string().optional(),
    discountType: z.enum(['percent', 'amount']).optional(),
    discountValue: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    minOrderValue: z.number().min(0).optional(),
    usageLimit: z.number().min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const validateVoucherSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Mã giảm giá không được để trống'),
    orderSubtotal: z.number().min(0, 'Tổng tiền đơn hàng không hợp lệ'),
  }),
});

export type CreateVoucherDto = z.infer<typeof createVoucherSchema>['body'];
export type UpdateVoucherDto = z.infer<typeof updateVoucherSchema>['body'];
export type ValidateVoucherDto = z.infer<typeof validateVoucherSchema>['body'];

