import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import { permissionController } from './permission.controller';
import {
  permissionIdParamSchema,
  permissionModuleParamSchema,
  updatePermissionSchema,
} from './permission.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

// List all permissions
router.get(
  '/',
  verifyToken,
  authorize(PERMISSIONS.PERMISSION_VIEW),
  permissionController.getAll
);

// Get permissions by module
router.get(
  '/module/:module',
  verifyToken,
  authorize(PERMISSIONS.PERMISSION_VIEW),
  validate(permissionModuleParamSchema),
  permissionController.getByModule
);

// Get permission by ID
router.get(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.PERMISSION_VIEW),
  validate(permissionIdParamSchema),
  permissionController.getById
);

// Update permission (name, description only)
router.patch(
  '/:id',
  verifyToken,
  authorize(PERMISSIONS.PERMISSION_UPDATE),
  validate(updatePermissionSchema),
  permissionController.update
);

export default router;
