import { z } from 'zod';
import { adjustStockSchema } from '../validations/product.validation';

export type AdjustStockDto = z.infer<typeof adjustStockSchema>['body'];
