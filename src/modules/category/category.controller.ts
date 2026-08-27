import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { CategoryService, categoryService } from './category.service';

export class CategoryController {
  constructor(private service: CategoryService = categoryService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.create(req.body);
    return ApiResponse.created(res, category, 'Category created successfully.');
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.service.getAll();
    return ApiResponse.success(res, categories);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.getBySlug(req.params.slug as string);
    return ApiResponse.success(res, category);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.update(req.params.id as string, req.body);
    return ApiResponse.success(res, category, 'Category updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    return ApiResponse.message(res, 'Category deleted successfully.');
  });
}

export const categoryController = new CategoryController();
