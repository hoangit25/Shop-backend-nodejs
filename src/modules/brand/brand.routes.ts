import { Router } from 'express';
import { brandController } from './brand.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { createBrandSchema, updateBrandSchema } from './brand.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.get('/', brandController.getAll);
router.get('/:slug', brandController.getBySlug);
router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.BRAND_CREATE),
  validate(createBrandSchema),
  brandController.create
);
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.BRAND_UPDATE),
  validate(updateBrandSchema),
  brandController.update
);
router.delete(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.BRAND_DELETE),
  brandController.delete
);

export default router;
