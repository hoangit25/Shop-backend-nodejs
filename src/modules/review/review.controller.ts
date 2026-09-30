import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { ReviewService, reviewService } from './review.service';

export class ReviewController {
  constructor(private service: ReviewService = reviewService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const review = await this.service.create({
      ...req.body,
      user: userId,
      createdBy: userId,
    });
    return ApiResponse.created(res, review, 'Review created successfully.');
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await this.service.getAll(req.query);
    return ApiResponse.success(res, reviews);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, review);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const review = await this.service.update(req.params.id as string, req.body, userId);
    return ApiResponse.success(res, review, 'Review updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const user = (req as any).user;
    // Check if user is admin / staff
    const isAdmin = Boolean(user?.roles?.some((r: any) => r.slug === 'super-admin' || r.name === 'Super Admin'));
    await this.service.delete(req.params.id as string, userId, isAdmin);
    return ApiResponse.message(res, 'Review deleted successfully.');
  });
}

export const reviewController = new ReviewController();
