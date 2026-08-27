import { BaseRepository } from '../../common/base.repository';
import { StoreModel, IStore } from './store.model';

export class StoreRepository extends BaseRepository<IStore> {
  constructor() {
    super(StoreModel);
  }

  async findByOwner(ownerId: string) {
    return this.findOne({ owner: ownerId, deleted: false });
  }

  async findBySlug(slug: string) {
    return this.findOne({ slug, deleted: false });
  }

  async findActiveBySlug(slug: string) {
    return this.findOne({ slug, deleted: false, isActive: true });
  }
}

export const storeRepository = new StoreRepository();
