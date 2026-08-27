import { AppError } from '../../common/AppError';
import { BrandRepository, brandRepository } from './brand.repository';

export class BrandService {
  constructor(private repository: BrandRepository = brandRepository) {}

  async create(payload: any) {
    const existed = await this.repository.findBySlug(payload.slug);
    if (existed) {
      throw AppError.Conflict('Brand slug already exists.', 'SLUG_EXISTS');
    }
    return this.repository.create(payload);
  }

  async getById(id: string) {
    const brand = await this.repository.findOne({ _id: id, deleted: false });
    if (!brand) {
      throw AppError.NotFound('Brand not found.', 'BRAND_NOT_FOUND');
    }
    return brand;
  }

  async getBySlug(slug: string) {
    const brand = await this.repository.findActiveBySlug(slug);
    if (!brand) {
      throw AppError.NotFound('Brand not found.', 'BRAND_NOT_FOUND');
    }
    return brand;
  }

  async getAll(filter: any = {}) {
    return this.repository.find({ deleted: false, ...filter }, undefined, {
      sort: { sortOrder: 1, name: 1 },
      lean: true,
    });
  }

  async update(id: string, payload: any) {
    const brand = await this.repository.findOne({ _id: id, deleted: false });
    if (!brand) {
      throw AppError.NotFound('Brand not found.', 'BRAND_NOT_FOUND');
    }

    if (payload.slug && payload.slug !== brand.slug) {
      const slugExists = await this.repository.findOne({
        slug: payload.slug,
        deleted: false,
        _id: { $ne: id },
      });
      if (slugExists) {
        throw AppError.Conflict('Brand slug already exists.', 'SLUG_EXISTS');
      }
    }

    Object.assign(brand, payload);
    await brand.save();
    return brand;
  }

  async delete(id: string) {
    const brand = await this.repository.findOne({ _id: id, deleted: false });
    if (!brand) {
      throw AppError.NotFound('Brand not found.', 'BRAND_NOT_FOUND');
    }
    await this.repository.softDelete(id);
    return true;
  }
}

export const brandService = new BrandService();
