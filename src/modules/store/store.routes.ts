import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { storeController } from './store.controller';
import { createStore, updateStore } from './store.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.STORE_CREATE),
  validate(createStore),
  storeController.create
);
router.get(
  '/me',
  verifyToken,
  authorize(PERMISSIONS.STORE_VIEW),
  storeController.getMyStore
);
router.get('/:slug', storeController.getBySlug);
router.patch(
  '/',
  verifyToken,
  authorize(PERMISSIONS.STORE_UPDATE),
  validate(updateStore),
  storeController.update
);
router.delete(
  '/',
  verifyToken,
  authorize(PERMISSIONS.STORE_DELETE),
  storeController.delete
);

export default router;
