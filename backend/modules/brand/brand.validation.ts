import { z } from 'zod';

export const createBrandBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must not exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  logo: z.string().url('Logo must be a valid URL').nullable().optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url('Website must be a valid URL').nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  sortOrder: z.number().int('Sort order must be an integer').min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateBrandBodySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(),
  logo: z.string().url().nullable().optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createBrandSchema = z.object({
  body: createBrandBodySchema,
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: updateBrandBodySchema,
});

export type CreateBrandDto = z.infer<typeof createBrandBodySchema>;
export type UpdateBrandDto = z.infer<typeof updateBrandBodySchema>;
