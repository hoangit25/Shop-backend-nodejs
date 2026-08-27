import { Types } from 'mongoose';
import { AppError } from '../../../common/AppError';
import { MediaOwnerType } from '../../media/media.model';
import { mediaRepository } from '../repositories/media.repository';
import { uploadToCloudinary } from '../../../config/cloudinary.config';

export class ProductMediaService {
  async getByProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError(400, 'Invalid Product ID.');
    }
    return mediaRepository.findByOwner(MediaOwnerType.PRODUCT, productId);
  }

  async uploadAndAttach(
    ownerId: string,
    fileBuffer: Buffer,
    fileName: string,
    createdBy?: string
  ) {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const uploadResult = await uploadToCloudinary(fileBuffer, fileName);

    const media = await mediaRepository.create({
      ownerType: MediaOwnerType.PRODUCT,
      ownerId: ownerId as any,
      url: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url,
      alt: fileName,
      fileName,
      mimeType: 'image/jpeg',
      isPrimary: false,
      sortOrder: 0,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
    });

    return media;
  }

  async deleteMedia(mediaId: string) {
    if (!Types.ObjectId.isValid(mediaId)) {
      throw new AppError(400, 'Invalid Media ID.');
    }

    const media = await mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppError(404, 'Media not found.');
    }

    return mediaRepository.softDelete(mediaId);
  }

  async setPrimaryMedia(mediaId: string) {
    if (!Types.ObjectId.isValid(mediaId)) {
      throw new AppError(400, 'Invalid Media ID.');
    }

    const media = await mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppError(404, 'Media not found.');
    }

    await mediaRepository.clearPrimary(
      MediaOwnerType.PRODUCT,
      (media as any).ownerId.toString()
    );

    return mediaRepository.setPrimary(mediaId);
  }
}

export const productMediaService = new ProductMediaService();
