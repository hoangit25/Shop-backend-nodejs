import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review id'),
  }),
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
