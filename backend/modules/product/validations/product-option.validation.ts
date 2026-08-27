import { z } from 'zod';

export const createProductOptionSchema = z.object({
  body: z.object({
    attributeId: z.string().min(1, 'Attribute ID is required'),
    attributeName: z.string().min(1, 'Attribute Name is required'),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateProductOptionSchema = z.object({
  body: z.object({
    attributeName: z.string().min(1).optional(),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});
