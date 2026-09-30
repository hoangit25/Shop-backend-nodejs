import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { reviewController } from './review.controller';
import { createReviewSchema, updateReviewSchema } from './review.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);

router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.REVIEW_CREATE),
  validate(createReviewSchema),
  reviewController.create
);
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.REVIEW_UPDATE),
  validate(updateReviewSchema),
  reviewController.update
);
router.delete(
  '/:id',
  verifyToken,
  reviewController.delete
);

export default router;
