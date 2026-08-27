import { z } from 'zod';

export const createStoreBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Store name must be at least 3 characters')
    .max(100, 'Store name must not exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug is invalid'),
  description: z.string().trim().max(1000).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().max(255).optional(),
});

export const updateStoreBodySchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().max(255).optional(),
  isActive: z.boolean().optional(),
  id: z.string().optional(),
});

export const createStoreSchema = z.object({
  body: createStoreBodySchema,
});

export const updateStoreSchema = z.object({
  body: updateStoreBodySchema.omit({ id: true }),
  params: updateStoreBodySchema.pick({ id: true }),
});

export const createStore = createStoreSchema;
export const updateStore = updateStoreSchema;

export type CreateStoreDto = z.infer<typeof createStoreBodySchema>;
export type UpdateStoreDto = z.infer<typeof updateStoreBodySchema>;
