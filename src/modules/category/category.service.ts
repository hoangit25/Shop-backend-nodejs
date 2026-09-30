import { AppError } from '../../common/AppError';
import { CategoryRepository, categoryRepository } from './category.repository';

export class CategoryService {
  constructor(private repository: CategoryRepository = categoryRepository) {}

  async create(payload: any) {
    const existed = await this.repository.findBySlug(payload.slug);
    if (existed) {
      throw AppError.Conflict('Category slug already exists.', 'SLUG_EXISTS');
    }

    if (payload.parent) {
      const parent = await this.repository.findOne({
        _id: payload.parent,
        deleted: false,
        isActive: true,
      });
      if (!parent) {
        throw AppError.NotFound('Parent category not found.', 'PARENT_NOT_FOUND');
      }
    }

    return this.repository.create({
      ...payload,
      parent: payload.parent ?? null,
    });
  }

  async getById(id: string) {
    const category = await this.repository.findOne({ _id: id, deleted: false });
    if (!category) {
      throw AppError.NotFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  async getBySlug(slug: string) {
    let category = await this.repository.findActiveBySlug(slug);
    if (!category && slug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await this.repository.findOne({ _id: slug, deleted: false });
    }
    if (!category) {
      throw AppError.NotFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  async getAll(filter: any = {}) {
    return this.repository.find({ deleted: false, ...filter }, undefined, {
      sort: { sortOrder: 1, createdAt: 1 },
      lean: true,
    });
  }

  async update(id: string, payload: any) {
    const category = await this.repository.findOne({ _id: id, deleted: false });
    if (!category) {
      throw AppError.NotFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }

    if (payload.slug && payload.slug !== category.slug) {
      const slugExists = await this.repository.findOne({
        slug: payload.slug,
        deleted: false,
        _id: { $ne: id },
      });
      if (slugExists) {
        throw AppError.Conflict('Category slug already exists.', 'SLUG_EXISTS');
      }
    }

    Object.assign(category, payload);
    await category.save();
    return category;
  }

  async delete(id: string) {
    const category = await this.repository.findOne({ _id: id, deleted: false });
    if (!category) {
      throw AppError.NotFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }

    const hasChildren = await this.repository.exists({
      parent: category._id,
      deleted: false,
    });

    if (hasChildren) {
      throw AppError.BadRequest(
        'Cannot delete category because it still has child categories.',
        'HAS_CHILDREN'
      );
    }

    await this.repository.softDelete(id);
    return true;
  }
}

export const categoryService = new CategoryService();
