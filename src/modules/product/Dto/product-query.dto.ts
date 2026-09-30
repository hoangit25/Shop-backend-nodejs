import { z } from 'zod';
import { productQuerySchema } from '../validations/product.validation';

export type ProductQueryDto = NonNullable<z.infer<typeof productQuerySchema>['query']>;
