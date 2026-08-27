import { BaseRepository } from '../../common/base.repository';
import { BrandModel, IBrand } from './brand.model';

export class BrandRepository extends BaseRepository<IBrand> {
  constructor() {
    super(BrandModel);
  }

  async findBySlug(slug: string) {
    return this.findOne({ slug, deleted: false });
  }

  async findActiveBySlug(slug: string) {
    return this.findOne({ slug, deleted: false, isActive: true });
  }
}

export const brandRepository = new BrandRepository();
