import { Request, Response } from 'express';
import { ApiResponse } from '../../../common/api-response';
import { asyncHandler } from '../../../common/async-handler';
import { AppError } from '../../../common/AppError';
import { productService, ProductService } from '../services/product.service';
import { productMediaService, ProductMediaService } from '../services/product-media.service';

export class ProductController {
  constructor(
    private service: ProductService = productService,
    private mediaService: ProductMediaService = productMediaService
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.create(
      req.body,
      (req as any).user?._id?.toString()
    );
    return ApiResponse.created(res, product, 'Product created successfully.');
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getAll(req.query);
    return ApiResponse.paginated(
      res,
      result.items,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalItems: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.page < result.pagination.totalPages,
        hasPrevPage: result.pagination.page > 1,
      },
      'Success'
    );
  });

  getPublished = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getPublished(req.query);
    return ApiResponse.paginated(
      res,
      result.items,
      {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalItems: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.page < result.pagination.totalPages,
        hasPrevPage: result.pagination.page > 1,
      },
      'Success'
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, product);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.getBySlug(req.params.slug as string);
    return ApiResponse.success(res, product);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.update(req.params.id as string, req.body);
    return ApiResponse.success(res, product, 'Product updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    return ApiResponse.message(res, 'Product deleted successfully.');
  });

  restore = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.restore(req.params.id as string);
    return ApiResponse.success(res, product, 'Product restored successfully.');
  });

  publish = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.publish(
      req.params.id as string,
      (req as any).user?._id?.toString()
    );
    return ApiResponse.success(res, product, 'Product published successfully.');
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.reject(
      req.params.id as string,
      (req as any).user?._id?.toString() || '',
      req.body.reason || 'No reason provided.'
    );
    return ApiResponse.success(res, product, 'Product rejected successfully.');
  });

  archive = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.archive(req.params.id as string);
    return ApiResponse.success(res, product, 'Product archived successfully.');
  });

  addVariant = asyncHandler(async (req: Request, res: Response) => {
    const variant = await this.service.addVariant(
      req.params.productId as string,
      req.body,
      (req as any).user?._id?.toString()
    );
    return ApiResponse.created(res, variant, 'Variant added successfully.');
  });

  updateVariant = asyncHandler(async (req: Request, res: Response) => {
    const variant = await this.service.updateVariant(req.params.variantId as string, req.body);
    return ApiResponse.success(res, variant, 'Variant updated successfully.');
  });

  deleteVariant = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteVariant(req.params.variantId as string);
    return ApiResponse.message(res, 'Variant deleted successfully.');
  });

  adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.adjustStock(
      req.params.variantId as string,
      req.body,
      (req as any).user?._id?.toString()
    );
    return ApiResponse.success(res, result, 'Stock adjusted successfully.');
  });

  getStockHistory = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getStockHistory(req.params.variantId as string);
    return ApiResponse.success(res, result);
  });

  getLowStock = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 50;
    const result = await this.service.getLowStock(limit);
    return ApiResponse.success(res, result);
  });

  getMedia = asyncHandler(async (req: Request, res: Response) => {
    const medias = await this.mediaService.getByProduct(req.params.productId as string);
    return ApiResponse.success(res, medias);
  });

  uploadMedia = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file?.buffer) {
      throw AppError.BadRequest('No file uploaded.', 'NO_FILE');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeInBytes = 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw AppError.BadRequest('Only JPEG, PNG, and WebP images are allowed.', 'INVALID_FILE_TYPE');
    }

    if (file.size > maxSizeInBytes) {
      throw AppError.BadRequest('File size must be less than 5MB.', 'FILE_TOO_LARGE');
    }

    const media = await this.mediaService.uploadAndAttach(
      req.params.productId as string,
      file.buffer,
      file.originalname,
      (req as any).user?._id?.toString()
    );

    return ApiResponse.created(res, media, 'Media uploaded successfully.');
  });

  deleteMedia = asyncHandler(async (req: Request, res: Response) => {
    await this.mediaService.deleteMedia(req.params.mediaId as string);
    return ApiResponse.message(res, 'Media deleted successfully.');
  });

  setPrimaryMedia = asyncHandler(async (req: Request, res: Response) => {
    const media = await this.mediaService.setPrimaryMedia(req.params.mediaId as string);
    return ApiResponse.success(res, media, 'Primary media updated successfully.');
  });
}

export const productController = new ProductController();
