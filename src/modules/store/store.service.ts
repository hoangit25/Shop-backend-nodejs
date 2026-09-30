import { AppError } from '../../common/AppError';
import { StoreRepository, storeRepository } from './store.repository';

export class StoreService {
  constructor(private repository: StoreRepository = storeRepository) {}

  async create(ownerId: string, payload: any) {
    const existedStore = await this.repository.findByOwner(ownerId);
    if (existedStore) {
      throw AppError.Conflict('You already own a store.', 'STORE_EXISTS');
    }

    const slugExists = await this.repository.findBySlug(payload.slug);
    if (slugExists) {
      throw AppError.Conflict('Store slug already exists.', 'SLUG_EXISTS');
    }

    return this.repository.create({
      ...payload,
      owner: ownerId,
    });
  }

  async getMyStore(ownerId: string) {
    const store = await this.repository.findByOwner(ownerId);
    if (!store) {
      throw AppError.NotFound('Store not found.', 'STORE_NOT_FOUND');
    }
    return store;
  }

  async getAll(filter: any = {}) {
    return this.repository.find(
      { deleted: false, isActive: true, ...filter },
      undefined,
      { sort: { createdAt: -1 }, lean: true }
    );
  }

  async getById(id: string) {
    const store = await this.repository.findOne({ _id: id, deleted: false });
    if (!store) {
      throw AppError.NotFound('Store not found.', 'STORE_NOT_FOUND');
    }
    return store;
  }

  async getBySlug(slug: string) {
    let store = await this.repository.findActiveBySlug(slug);
    if (!store && slug.match(/^[0-9a-fA-F]{24}$/)) {
      store = await this.repository.findOne({ _id: slug, deleted: false });
    }
    if (!store) {
      throw AppError.NotFound('Store not found.', 'STORE_NOT_FOUND');
    }
    return store;
  }

  async update(ownerId: string, payload: any) {
    const store = await this.repository.findByOwner(ownerId);
    if (!store) {
      throw AppError.NotFound('Store not found.', 'STORE_NOT_FOUND');
    }

    Object.assign(store, payload);
    await store.save();
    return store;
  }

  async delete(ownerId: string) {
    const store = await this.repository.findByOwner(ownerId);
    if (!store) {
      throw AppError.NotFound('Store not found.', 'STORE_NOT_FOUND');
    }
    await this.repository.softDelete((store as any)._id.toString());
    return true;
  }
}

export const storeService = new StoreService();
