import { BaseRepository } from '../../common/base.repository';
import { MediaModel, IMedia, MediaOwnerType } from './media.model';

export class MediaRepository extends BaseRepository<IMedia> {
  constructor() {
    super(MediaModel);
  }

  async findByOwner(ownerType: MediaOwnerType, ownerId: string) {
    return this.find(
      { ownerType, ownerId, deleted: false },
      undefined,
      { sort: { sortOrder: 1 } }
    );
  }

  async findPrimaryByOwner(ownerType: MediaOwnerType, ownerId: string) {
    return this.findOne({
      ownerType,
      ownerId,
      isPrimary: true,
      deleted: false,
    });
  }

  async setPrimary(mediaId: string, ownerType: MediaOwnerType, ownerId: string) {
    // Unset current primary
    await MediaModel.updateMany(
      { ownerType, ownerId, deleted: false },
      { $set: { isPrimary: false } }
    );
    // Set new primary
    return this.updateById(mediaId, { $set: { isPrimary: true } });
  }

  async countByOwner(ownerType: MediaOwnerType, ownerId: string) {
    return this.count({ ownerType, ownerId, deleted: false });
  }
}

export const mediaRepository = new MediaRepository();
