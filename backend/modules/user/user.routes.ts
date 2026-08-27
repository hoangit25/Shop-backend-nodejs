import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import * as userController from './user.controller';
import {
  updateUserSchema,
  changePasswordSchema,
  assignRoleSchema,
  permissionOverrideSchema,
  userIdParamSchema,
} from './user.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

// Current logged in user routes (Self profile management)
router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, validate(updateUserSchema), userController.updateUser);
router.put('/me/password', verifyToken, validate(changePasswordSchema), userController.changePassword);

// User administration routes
router.get('/', verifyToken, authorize(PERMISSIONS.USER_VIEW), userController.listUsers);
router.get('/:id', verifyToken, authorize(PERMISSIONS.USER_VIEW), validate(userIdParamSchema), userController.getUserById);
router.post(
  '/:id/roles',
  verifyToken,
  authorize(PERMISSIONS.USER_UPDATE),
  validate(userIdParamSchema),
  validate(assignRoleSchema),
  userController.assignRole
);
router.delete(
  '/:id/roles/:roleId',
  verifyToken,
  authorize(PERMISSIONS.USER_UPDATE),
  userController.removeRole
);
router.post(
  '/:id/permission-overrides',
  verifyToken,
  authorize(PERMISSIONS.USER_UPDATE),
  validate(userIdParamSchema),
  validate(permissionOverrideSchema),
  userController.setPermissionOverride
);
router.delete(
  '/:id/permission-overrides/:permissionId',
  verifyToken,
  authorize(PERMISSIONS.USER_UPDATE),
  userController.removePermissionOverride
);

export default router;
