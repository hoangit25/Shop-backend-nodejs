import { Request, Response } from 'express';
import { ApiResponse } from '../../common/api-response';
import { asyncHandler } from '../../common/async-handler';
import { VoucherService, voucherService } from './voucher.service';

export class VoucherController {
  constructor(private service: VoucherService = voucherService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const voucher = await this.service.create(req.body);
    return ApiResponse.created(res, voucher, 'Voucher created successfully.');
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const vouchers = await this.service.getAll();
    return ApiResponse.success(res, vouchers);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const voucher = await this.service.getById(req.params.id as string);
    return ApiResponse.success(res, voucher);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const voucher = await this.service.update(req.params.id as string, req.body);
    return ApiResponse.success(res, voucher, 'Voucher updated successfully.');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    return ApiResponse.message(res, 'Voucher deleted successfully.');
  });
}

export const voucherController = new VoucherController();
