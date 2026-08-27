import { z } from 'zod';

const mediaSchema = z.object({
  url: z.string().min(1, 'Media URL is required'),
  thumbnailUrl: z.string().optional(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const variantOptionSchema = z.object({
  attributeId: z.string().min(1, 'Attribute ID is required'),
  attributeValueId: z.string().min(1, 'Attribute Value ID is required'),
  attributeName: z.string().min(1, 'Attribute Name is required'),
  attributeValue: z.string().min(1, 'Attribute Value is required'),
});

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  compareAtPrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
  length: z.number().nonnegative().optional(),
  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative('Quantity must be non-negative'),
  isDefault: z.boolean().optional(),
  options: z.array(variantOptionSchema).optional().default([]),
});

export const createProductSchema = z.object({
  body: z.object({
    storeId: z.string().min(1, 'Store ID is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
    brandId: z.string().optional(),
    name: z.string().min(1, 'Product name is required'),
    slug: z.string().min(1, 'Slug is required'),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    hasVariants: z.boolean().optional().default(false),
    status: z
      .enum(['draft', 'pending', 'published', 'rejected', 'hidden', 'archived'])
      .optional(),
    isActive: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
    weight: z.number().nonnegative().optional(),
    variants: z.array(variantSchema).optional().default([]),
    medias: z.array(mediaSchema).optional().default([]),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    storeId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    brandId: z.string().optional(),
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    hasVariants: z.boolean().optional(),
    status: z
      .enum(['draft', 'pending', 'published', 'rejected', 'hidden', 'archived'])
      .optional(),
    isActive: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
    weight: z.number().nonnegative().optional(),
  }),
});

export const addVariantSchema = z.object({
  body: variantSchema,
});

export const updateVariantSchema = z.object({
  body: z.object({
    sku: z.string().min(1).optional(),
    barcode: z.string().optional(),
    price: z.number().nonnegative().optional(),
    compareAtPrice: z.number().nonnegative().optional(),
    costPrice: z.number().nonnegative().optional(),
    weight: z.number().nonnegative().optional(),
    length: z.number().nonnegative().optional(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    isDefault: z.boolean().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    options: z.array(variantOptionSchema).optional(),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantity: z.number().min(0, 'Quantity must be a non-negative number'),
    type: z
      .enum([
        'increase',
        'decrease',
        'adjustment',
        'purchase',
        'sale',
        'return',
        'damage',
      ])
      .optional(),
    note: z.string().optional(),
    referenceType: z.string().optional(),
    referenceId: z.string().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      storeId: z.string().optional(),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      isActive: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
});
