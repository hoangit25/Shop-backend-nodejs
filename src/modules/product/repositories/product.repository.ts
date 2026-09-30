import { BaseRepository } from '../../../common/base.repository';
import { ProductModel, IProduct, ProductStatus } from '../models/product.model';
import { IProductRepository } from './product.repository.interface';

export class ProductRepository extends BaseRepository<IProduct> implements IProductRepository {
  constructor() {
    super(ProductModel);
  }

  async findBySlug(slug: string) {
    return this.findOne({
      slug: slug.toLowerCase(),
      deleted: false,
    });
  }

  async findWithDetails(id: string) {
    return this.model
      .findOne({ _id: id, deleted: false })
      .populate('store', 'name email phone logo')
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .exec();
  }

  async findPublished(filter: any = {}) {
    return this.find({
      ...filter,
      status: ProductStatus.PUBLISHED,
      deleted: false,
      isActive: true,
    });
  }

  async findByStore(storeId: string) {
    return this.find({
      store: storeId,
      deleted: false,
    });
  }

  async findDraftByStore(storeId: string) {
    return this.find({
      store: storeId,
      status: ProductStatus.DRAFT,
      deleted: false,
    });
  }

  async findPending() {
    return this.find({
      status: ProductStatus.PENDING,
      deleted: false,
    });
  }

  async publish(productId: string, approvedBy: string, session?: any) {
    return this.updateById(
      productId,
      {
        status: ProductStatus.PUBLISHED,
        approvedBy: approvedBy as any,
        approvedAt: new Date(),
        rejectedReason: '',
      },
      { session }
    );
  }

  async reject(productId: string, approvedBy: string, reason: string, session?: any) {
    return this.updateById(
      productId,
      {
        status: ProductStatus.REJECTED,
        approvedBy: approvedBy as any,
        approvedAt: new Date(),
        rejectedReason: reason,
      },
      { session }
    );
  }

  async archive(productId: string, session?: any) {
    return this.updateById(
      productId,
      {
        status: ProductStatus.ARCHIVED,
      },
      { session }
    );
  }
}

export const productRepository = new ProductRepository();
