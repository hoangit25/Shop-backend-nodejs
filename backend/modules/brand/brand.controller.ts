import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { BrandService, brandService } from './brand.service';

export class BrandController {
  constructor(private service: BrandService = brandService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.create(req.body);
    return ApiResponse.created(res, brand, 'Brand created successfully.');
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const brands = await this.service.getAll();
    return ApiResponse.success(res, brands);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.getBySlug(req.params.slug as string);
    return ApiResponse.success(res, brand);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.update(req.params.id as string, req.body);
    return ApiResponse.success(res, brand, 'Brand updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    return ApiResponse.message(res, 'Brand deleted successfully.');
  });
}

export const brandController = new BrandController();
