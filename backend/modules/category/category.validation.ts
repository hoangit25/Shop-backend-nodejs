import { z } from 'zod';

export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  parent: z.string().nullable().optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url('Image must be a valid URL').nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategoryBodySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(),
  parent: z.string().nullable().optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  body: createCategoryBodySchema,
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: updateCategoryBodySchema,
});

export type CreateCategoryDto = z.infer<typeof createCategoryBodySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryBodySchema>;
