import { BaseRepository } from '../../common/base.repository';
import { CategoryModel, ICategory } from './category.model';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(CategoryModel);
  }

  async findBySlug(slug: string) {
    return this.findOne({ slug, deleted: false });
  }

  async findActiveBySlug(slug: string) {
    return this.findOne({ slug, deleted: false, isActive: true });
  }
}

export const categoryRepository = new CategoryRepository();
