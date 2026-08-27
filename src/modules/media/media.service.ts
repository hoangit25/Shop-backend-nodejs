import { AppError } from '../../common/AppError';
import { uploadToCloudinary } from '../../config/cloudinary.config';
import { MediaOwnerType, MediaType } from './media.model';
import { MediaRepository, mediaRepository } from './media.repository';

export class MediaService {
  constructor(private repository: MediaRepository = mediaRepository) {}

  async upload(
    file: Express.Multer.File,
    ownerType: MediaOwnerType,
    ownerId: string,
    createdBy: string
  ) {
    const { secure_url, public_id } = await uploadToCloudinary(
      file.buffer,
      file.originalname
    );

    const existingCount = await this.repository.countByOwner(ownerType, ownerId);

    const media = await this.repository.create({
      ownerType,
      ownerId: ownerId as any,
      type: file.mimetype.startsWith('video/') ? MediaType.VIDEO : MediaType.IMAGE,
      url: secure_url,
      alt: file.originalname,
      fileName: public_id,
      mimeType: file.mimetype,
      size: file.size,
      sortOrder: existingCount,
      isPrimary: existingCount === 0,
      deleted: false,
      createdBy: createdBy as any,
    });

    return media;
  }

  async getByOwner(ownerType: MediaOwnerType, ownerId: string) {
    return this.repository.findByOwner(ownerType, ownerId);
  }

  async getById(id: string) {
    const media = await this.repository.findOne({ _id: id, deleted: false });
    if (!media) {
      throw AppError.NotFound('Media not found.', 'MEDIA_NOT_FOUND');
    }
    return media;
  }

  async setPrimary(id: string) {
    const media = await this.getById(id);
    await this.repository.setPrimary(
      id,
      media.ownerType,
      media.ownerId.toString()
    );
    return this.getById(id);
  }

  async updateAlt(id: string, alt: string) {
    const media = await this.getById(id);
    media.alt = alt;
    await media.save();
    return media;
  }

  async updateSortOrder(id: string, sortOrder: number) {
    const media = await this.getById(id);
    media.sortOrder = sortOrder;
    await media.save();
    return media;
  }

  async delete(id: string) {
    const media = await this.getById(id);
    await this.repository.softDelete(id);

    // If deleted media was primary, set next one as primary
    if (media.isPrimary) {
      const remaining = await this.repository.findByOwner(
        media.ownerType,
        media.ownerId.toString()
      );
      if (remaining.length > 0) {
        await this.repository.setPrimary(
          (remaining[0] as any)._id.toString(),
          media.ownerType,
          media.ownerId.toString()
        );
      }
    }

    return true;
  }
}

export const mediaService = new MediaService();
