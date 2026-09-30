import { Request, Response } from 'express';
import { ApiResponse } from '../../../common/api-response';
import { asyncHandler } from '../../../common/async-handler';
import { productOptionService, ProductOptionService } from '../services/product-option.service';

export class ProductOptionController {
  constructor(private service: ProductOptionService = productOptionService) {}

  getByProduct = asyncHandler(async (req: Request, res: Response) => {
    const options = await this.service.getByProduct(req.params.productId as string);
    return ApiResponse.success(res, options);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const option = await this.service.create(req.params.productId as string, req.body);
    return ApiResponse.created(res, option, 'Product option created successfully.');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const option = await this.service.update(req.params.optionId as string, req.body);
    return ApiResponse.success(res, option, 'Product option updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.optionId as string);
    return ApiResponse.message(res, 'Product option deleted successfully.');
  });
}

export const productOptionController = new ProductOptionController();
