import { z } from 'zod';
import { MediaOwnerType } from './media.model';

export const uploadMediaSchema = z.object({
  body: z.object({
    ownerType: z.nativeEnum(MediaOwnerType, {
      message: 'ownerType must be one of: product, variant, category, brand, store, user',
    }),
    ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ownerId format'),
  }),
});

export const getMediaByOwnerSchema = z.object({
  query: z.object({
    ownerType: z.nativeEnum(MediaOwnerType, {
      message: 'ownerType must be one of: product, variant, category, brand, store, user',
    }),
    ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ownerId format'),
  }),
});

export const mediaIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID'),
  }),
});

export const updateAltSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID'),
  }),
  body: z.object({
    alt: z.string().max(500, 'Alt text must not exceed 500 characters'),
  }),
});

export const updateSortOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID'),
  }),
  body: z.object({
    sortOrder: z.number().int().min(0, 'Sort order must be >= 0'),
  }),
});
