import { z } from 'zod';
import {
  createProductOptionSchema,
  updateProductOptionSchema,
} from '../validations/product-option.validation';

export type CreateProductOptionDto = z.infer<typeof createProductOptionSchema>['body'];
export type UpdateProductOptionDto = z.infer<typeof updateProductOptionSchema>['body'];
