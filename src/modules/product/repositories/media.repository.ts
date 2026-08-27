import { BaseRepository } from '../../../common/base.repository';
import { MediaModel, IMedia, MediaOwnerType } from '../../media/media.model';

export class MediaRepository extends BaseRepository<IMedia> {
  constructor() {
    super(MediaModel);
  }

  async findByOwner(ownerType: MediaOwnerType | string, ownerId: string) {
    return this.find(
      {
        ownerType: ownerType as MediaOwnerType,
        ownerId,
        deleted: false,
      },
      undefined,
      {
        sort: {
          sortOrder: 1,
          createdAt: 1,
        },
      }
    );
  }

  async findPrimary(ownerType: MediaOwnerType | string, ownerId: string) {
    return this.findOne({
      ownerType: ownerType as MediaOwnerType,
      ownerId,
      isPrimary: true,
      deleted: false,
    });
  }

  async clearPrimary(ownerType: MediaOwnerType | string, ownerId: string, session?: any) {
    return this.model.updateMany(
      {
        ownerType: ownerType as MediaOwnerType,
        ownerId,
      },
      {
        isPrimary: false,
      },
      { session }
    );
  }

  async setPrimary(mediaId: string, session?: any) {
    return this.updateById(
      mediaId,
      {
        isPrimary: true,
      },
      { session }
    );
  }

  async softDeleteByOwner(ownerType: MediaOwnerType | string, ownerId: string, session?: any) {
    return this.model.updateMany(
      {
        ownerType: ownerType as MediaOwnerType,
        ownerId,
      },
      {
        deleted: true,
      },
      { session }
    );
  }

  async updateSortOrder(mediaId: string, sortOrder: number, session?: any) {
    return this.updateById(
      mediaId,
      {
        sortOrder,
      },
      { session }
    );
  }
}

export const mediaRepository = new MediaRepository();
