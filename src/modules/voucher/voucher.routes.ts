import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { voucherController } from './voucher.controller';
import { createVoucherSchema, updateVoucherSchema } from './voucher.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.VOUCHER_CREATE),
  validate(createVoucherSchema),
  voucherController.create
);
router.get(
  '/',
  verifyToken,
  authorize(PERMISSIONS.VOUCHER_VIEW),
  voucherController.getAll
);
router.get(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.VOUCHER_VIEW),
  voucherController.getById
);
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.VOUCHER_UPDATE),
  validate(updateVoucherSchema),
  voucherController.update
);
router.delete(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.VOUCHER_DELETE),
  voucherController.delete
);

export default router;
