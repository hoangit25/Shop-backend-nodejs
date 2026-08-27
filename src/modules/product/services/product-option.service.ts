import { Types } from 'mongoose';
import { AppError } from '../../../common/AppError';
import {
  productOptionRepository,
  ProductOptionRepository,
} from '../repositories/product-option.repository';
import {
  productRepository,
  ProductRepository,
} from '../repositories/product.repository';

export class ProductOptionService {
  constructor(
    private productOptionRepo: ProductOptionRepository = productOptionRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  async create(productId: string, payload: any) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findOne({
      _id: productId,
      deleted: false,
    });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }

    const existing = await this.productOptionRepo.findByProductAndAttribute(
      productId,
      payload.attributeId
    );
    if (existing) {
      throw new AppError(409, 'This attribute is already configured on the product.');
    }

    return this.productOptionRepo.create({
      product: new Types.ObjectId(productId),
      attribute: new Types.ObjectId(payload.attributeId),
      isRequired: payload.isRequired ?? true,
      sortOrder: payload.sortOrder ?? 0,
    });
  }

  async update(optionId: string, payload: any) {
    if (!Types.ObjectId.isValid(optionId)) {
      throw new AppError(400, 'Invalid product option ID.');
    }

    const option = await this.productOptionRepo.findOne({
      _id: optionId,
      deleted: false,
    });
    if (!option) {
      throw new AppError(404, 'Product option not found.');
    }

    return this.productOptionRepo.updateById(optionId, { ...payload });
  }

  async delete(optionId: string) {
    if (!Types.ObjectId.isValid(optionId)) {
      throw new AppError(400, 'Invalid product option ID.');
    }

    const option = await this.productOptionRepo.findOne({
      _id: optionId,
      deleted: false,
    });
    if (!option) {
      throw new AppError(404, 'Product option not found.');
    }

    return this.productOptionRepo.softDelete(optionId);
  }

  async getByProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError(400, 'Invalid Product ID.');
    }
    return this.productOptionRepo.findByProduct(productId);
  }
}

export const productOptionService = new ProductOptionService();
