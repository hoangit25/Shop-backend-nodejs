import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { mediaController } from './media.controller';
import {
  uploadMediaSchema,
  getMediaByOwnerSchema,
  mediaIdParamSchema,
  updateAltSchema,
  updateSortOrderSchema,
} from './media.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF images and MP4 videos are allowed.'));
    }
  },
});

const router = Router();

// Upload media (multipart/form-data)
router.post(
  '/',
  verifyToken,
  upload.single('file'),
  validate(uploadMediaSchema),
  mediaController.upload
);

// Get media by owner (query: ownerType, ownerId)
router.get(
  '/',
  verifyToken,
  validate(getMediaByOwnerSchema),
  mediaController.getByOwner
);

// Get single media by ID
router.get(
  '/:id',
  verifyToken,
  validate(mediaIdParamSchema),
  mediaController.getById
);

// Set media as primary
router.patch(
  '/:id/primary',
  verifyToken,
  validate(mediaIdParamSchema),
  mediaController.setPrimary
);

// Update alt text
router.patch(
  '/:id/alt',
  verifyToken,
  validate(updateAltSchema),
  mediaController.updateAlt
);

// Update sort order
router.patch(
  '/:id/sort-order',
  verifyToken,
  validate(updateSortOrderSchema),
  mediaController.updateSortOrder
);

// Delete media (soft delete)
router.delete(
  '/:id',
  verifyToken,
  validate(mediaIdParamSchema),
  mediaController.delete
);

export default router;
