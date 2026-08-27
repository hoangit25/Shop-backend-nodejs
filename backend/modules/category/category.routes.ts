import { Router } from 'express';
import { categoryController } from './category.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './category.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);
router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.CATEGORY_CREATE),
  validate(createCategorySchema),
  categoryController.create
);
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.CATEGORY_UPDATE),
  validate(updateCategorySchema),
  categoryController.update
);
router.delete(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.CATEGORY_DELETE),
  categoryController.delete
);

export default router;
