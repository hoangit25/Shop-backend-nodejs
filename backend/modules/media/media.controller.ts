import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { AppError } from '../../common/AppError';
import { MediaService, mediaService } from './media.service';
import { MediaOwnerType } from './media.model';

export class MediaController {
  constructor(private service: MediaService = mediaService) {}

  upload = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw AppError.BadRequest('No file uploaded.', 'NO_FILE');
    }

    const { ownerType, ownerId } = req.body;
    const createdBy = (req as any).user?._id?.toString();

    const media = await this.service.upload(
      file,
      ownerType as MediaOwnerType,
      ownerId,
      createdBy
    );

    return ApiResponse.created(res, media, 'Media uploaded successfully.');
  });

  getByOwner = asyncHandler(async (req: Request, res: Response) => {
    const { ownerType, ownerId } = req.query;
    const media = await this.service.getByOwner(
      ownerType as MediaOwnerType,
      ownerId as string
    );
    return ApiResponse.success(res, media);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const media = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, media);
  });

  setPrimary = asyncHandler(async (req: Request, res: Response) => {
    const media = await this.service.setPrimary(req.params.id as string);
    return ApiResponse.success(res, media, 'Media set as primary.');
  });

  updateAlt = asyncHandler(async (req: Request, res: Response) => {
    const media = await this.service.updateAlt(
      req.params.id as string,
      req.body.alt
    );
    return ApiResponse.success(res, media, 'Alt text updated.');
  });

  updateSortOrder = asyncHandler(async (req: Request, res: Response) => {
    const media = await this.service.updateSortOrder(
      req.params.id as string,
      req.body.sortOrder
    );
    return ApiResponse.success(res, media, 'Sort order updated.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    return ApiResponse.message(res, 'Media deleted successfully.');
  });
}

export const mediaController = new MediaController();
