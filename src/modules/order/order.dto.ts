import { z } from 'zod';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';

export type CreateOrderDto = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>['body'];
export type OrderProductItemDto = CreateOrderDto['products'][number];
