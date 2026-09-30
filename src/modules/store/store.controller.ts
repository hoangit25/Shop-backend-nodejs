import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { StoreService, storeService } from './store.service';

export class StoreController {
  constructor(private service: StoreService = storeService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = (req as any).user?._id?.toString();
    const store = await this.service.create(ownerId, req.body);
    return ApiResponse.created(res, store, 'Store created successfully.');
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const stores = await this.service.getAll(req.query);
    return ApiResponse.success(res, stores);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const store = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, store);
  });

  getMyStore = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = (req as any).user?._id?.toString();
    const store = await this.service.getMyStore(ownerId);
    return ApiResponse.success(res, store);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const store = await this.service.getBySlug(req.params.slug as string);
    return ApiResponse.success(res, store);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = (req as any).user?._id?.toString();
    const store = await this.service.update(ownerId, req.body);
    return ApiResponse.success(res, store, 'Store updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = (req as any).user?._id?.toString();
    await this.service.delete(ownerId);
    return ApiResponse.message(res, 'Store deleted successfully.');
  });
}

export const storeController = new StoreController();
