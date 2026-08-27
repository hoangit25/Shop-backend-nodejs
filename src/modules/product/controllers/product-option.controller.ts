import { Request, Response } from 'express';
import { productOptionService } from '../services/product-option.service';

class ProductOptionController {
  getByProduct = async (req: Request, res: Response) => {
    const options = await productOptionService.getByProduct(req.params.productId as string);
    return res.json({
      success: true,
      data: options,
    });
  };

  create = async (req: Request, res: Response) => {
    const option = await productOptionService.create(req.params.productId as string, req.body);
    return res.status(201).json({
      success: true,
      message: 'Product option created successfully.',
      data: option,
    });
  };

  update = async (req: Request, res: Response) => {
    const option = await productOptionService.update(req.params.optionId as string, req.body);
    return res.json({
      success: true,
      message: 'Product option updated successfully.',
      data: option,
    });
  };

  delete = async (req: Request, res: Response) => {
    await productOptionService.delete(req.params.optionId as string);
    return res.json({
      success: true,
      message: 'Product option deleted successfully.',
    });
  };
}

export const productOptionController = new ProductOptionController();
