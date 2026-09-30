import { z } from 'zod';
import {
  variantSchema,
  addVariantSchema,
  updateVariantSchema,
} from '../validations/product.validation';

export type VariantDto = z.infer<typeof variantSchema>;
export type AddVariantDto = z.infer<typeof addVariantSchema>['body'];
export type UpdateVariantDto = z.infer<typeof updateVariantSchema>['body'];
export type VariantOptionDto = NonNullable<VariantDto['options']>[number];
