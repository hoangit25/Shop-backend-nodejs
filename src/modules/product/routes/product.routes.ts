import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate.middleware';
import { productController } from '../controllers/product.controller';
import {
  createProductSchema,
  updateProductSchema,
  addVariantSchema,
  updateVariantSchema,
  adjustStockSchema,
  productQuerySchema,
} from '../validations/product.validation';
import { PERMISSIONS } from '../../../constants/permissions';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.get('/', validate(productQuerySchema), productController.getAll);
router.get('/published', validate(productQuerySchema), productController.getPublished);
router.get('/low-stock', verifyToken, authorize(PERMISSIONS.PRODUCT_VIEW), productController.getLowStock);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);

router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_CREATE),
  validate(createProductSchema),
  productController.create
);
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  validate(updateProductSchema),
  productController.update
);
router.delete(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_DELETE),
  productController.delete
);
router.patch(
  '/:id/restore',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_DELETE),
  productController.restore
);
router.patch(
  '/:id/publish',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE_STATUS),
  productController.publish
);
router.patch(
  '/:id/reject',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE_STATUS),
  productController.reject
);
router.patch(
  '/:id/archive',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE_STATUS),
  productController.archive
);

router.post(
  '/:productId/variants',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  validate(addVariantSchema),
  productController.addVariant
);
router.patch(
  '/variants/:variantId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  validate(updateVariantSchema),
  productController.updateVariant
);
router.delete(
  '/variants/:variantId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  productController.deleteVariant
);

router.patch(
  '/variants/:variantId/adjust-stock',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE_STOCK),
  validate(adjustStockSchema),
  productController.adjustStock
);
router.get(
  '/variants/:variantId/stock-history',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  productController.getStockHistory
);

router.get(
  '/:productId/media',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  productController.getMedia
);
router.post(
  '/:productId/media',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  upload.single('file'),
  productController.uploadMedia
);
router.delete(
  '/media/:mediaId',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  productController.deleteMedia
);
router.patch(
  '/media/:mediaId/primary',
  verifyToken,
  authorize(PERMISSIONS.PRODUCT_UPDATE),
  productController.setPrimaryMedia
);

export default router;
