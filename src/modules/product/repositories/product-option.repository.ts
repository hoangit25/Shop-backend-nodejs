import { BaseRepository } from '../../../common/base.repository';
import { ProductOptionModel, IProductOption } from '../models/product-option.model';

export class ProductOptionRepository extends BaseRepository<IProductOption> {
  constructor() {
    super(ProductOptionModel);
  }

  async findByProduct(productId: string) {
    return this.find(
      {
        product: productId,
        deleted: false,
      },
      undefined,
      {
        sort: { sortOrder: 1 },
      }
    );
  }

  async findByProductAndAttribute(productId: string, attributeId: string) {
    return this.findOne({
      product: productId,
      attribute: attributeId,
      deleted: false,
    });
  }
}

export const productOptionRepository = new ProductOptionRepository();
