import { Router } from 'express';
import { verifyToken } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate.middleware';
import { productOptionController } from '../controllers/product-option.controller';
import {
  createProductOptionSchema,
  updateProductOptionSchema,
} from '../validations/product-option.validation';
import { PERMISSIONS } from '../../../constants/permissions';

const router = Router();

router.get(
  '/product/:productId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  productOptionController.getByProduct
);
router.post(
  '/product/:productId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  validate(createProductOptionSchema),
  productOptionController.create
);
router.patch(
  '/:optionId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  validate(updateProductOptionSchema),
  productOptionController.update
);
router.delete(
  '/:optionId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  productOptionController.delete
);

export default router;
