import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { orderController } from './order.controller';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.post(
  '/',
  verifyToken,
  authorize(PERMISSIONS.ORDER_CREATE),
  validate(createOrderSchema),
  orderController.create
);
router.post(
  '/checkout',
  verifyToken,
  authorize(PERMISSIONS.ORDER_CREATE),
  validate(createOrderSchema),
  orderController.checkout
);
router.get(
  '/me',
  verifyToken,
  orderController.getMyOrders
);
router.get(
  '/',
  verifyToken,
  authorize(PERMISSIONS.ORDER_VIEW),
  orderController.getAll
);
router.get(
  '/:id',
  verifyToken,
  orderController.getById
);
router.patch(
  '/:id/status',
  verifyToken,
  authorize(PERMISSIONS.ORDER_UPDATE),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);
router.patch(
  '/:id/cancel',
  verifyToken,
  orderController.cancel
);
router.patch(
  '/:id/confirm',
  verifyToken,
  authorize(PERMISSIONS.ORDER_CONFIRM),
  orderController.confirm
);
router.patch(
  '/:id/ship',
  verifyToken,
  authorize(PERMISSIONS.ORDER_SHIPPING),
  orderController.ship
);
router.patch(
  '/:id/complete',
  verifyToken,
  authorize(PERMISSIONS.ORDER_COMPLETE),
  orderController.complete
);

export default router;
