import { BaseRepository } from '../../../common/base.repository';
import { ProductVariantModel, IProductVariant, ProductVariantStatus } from '../models/product-variant.model';

export class ProductVariantRepository extends BaseRepository<IProductVariant> {
  constructor() {
    super(ProductVariantModel);
  }

  async findByProduct(productId: string) {
    return this.find(
      {
        product: productId,
        deleted: false,
      },
      undefined,
      {
        sort: { createdAt: 1 },
      }
    );
  }

  async findBySku(sku: string) {
    return this.findOne({
      sku: sku.toUpperCase(),
      deleted: false,
    });
  }

  async findDefaultVariant(productId: string) {
    return this.findOne({
      product: productId,
      isDefault: true,
      deleted: false,
    });
  }

  async findActiveVariants(productId: string) {
    return this.find(
      {
        product: productId,
        status: ProductVariantStatus.ACTIVE,
        deleted: false,
      },
      undefined,
      {
        sort: { createdAt: 1 },
      }
    );
  }

  async existsSku(sku: string, excludeId?: string) {
    const filter: any = {
      sku: sku.toUpperCase(),
      deleted: false,
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  async setDefaultVariant(productId: string, variantId: string, session?: any) {
    await this.model.updateMany(
      { product: productId },
      { isDefault: false },
      { session }
    );
    return this.updateById(
      variantId,
      { isDefault: true },
      { session }
    );
  }

  async countByProduct(productId: string) {
    return this.count({
      product: productId,
      deleted: false,
    });
  }

  async softDeleteByProduct(productId: string, session?: any) {
    return this.model.updateMany(
      { product: productId, deleted: false },
      { deleted: true },
      { session }
    );
  }
}

export const productVariantRepository = new ProductVariantRepository();
