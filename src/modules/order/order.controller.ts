import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { OrderService, orderService } from './order.service';

export class OrderController {
  constructor(private service: OrderService = orderService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.create(req.body);
    return ApiResponse.created(res, order, 'Order created successfully.');
  });

  checkout = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const order = await this.service.checkout(req.body, userId);
    return ApiResponse.created(res, order, 'Order placed successfully.');
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const orders = await this.service.getAll();
    return ApiResponse.success(res, orders);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, order);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.updateStatus(req.params.id as string, req.body.status);
    return ApiResponse.success(res, order, 'Order status updated.');
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.cancel(req.params.id as string);
    return ApiResponse.success(res, order, 'Order canceled.');
  });

  confirm = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.confirm(req.params.id as string);
    return ApiResponse.success(res, order, 'Order confirmed.');
  });

  ship = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.ship(req.params.id as string);
    return ApiResponse.success(res, order, 'Order shipped.');
  });

  complete = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.complete(req.params.id as string);
    return ApiResponse.success(res, order, 'Order completed.');
  });
}

export const orderController = new OrderController();
