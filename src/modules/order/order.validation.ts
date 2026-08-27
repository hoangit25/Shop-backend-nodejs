import { z } from 'zod';
import { OrderStatus } from './order.model';

export const createOrderSchema = z.object({
  body: z.object({
    products: z.array(
      z.object({
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
        variant: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid variant id').optional(),
        quantity: z.number().min(1),
        price: z.number().min(0),
      })
    ),
    voucherCode: z.string().trim().min(1).optional(),
    shippingAddress: z.string().optional(),
    paymentMethod: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order id'),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});
