import { Router } from 'express';
import { roleController } from './role.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate.middleware';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
} from './role.validation';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.get('/', verifyToken, authorize(PERMISSIONS.ROLE_VIEW), roleController.getAll);
router.get('/slug/:slug', verifyToken, authorize(PERMISSIONS.ROLE_VIEW), roleController.getBySlug);
router.get('/:id', verifyToken, authorize(PERMISSIONS.ROLE_VIEW), validate(getRoleByIdSchema), roleController.getById);
router.post('/', verifyToken, authorize(PERMISSIONS.ROLE_CREATE), validate(createRoleSchema), roleController.create);
router.patch('/:id', verifyToken, authorize(PERMISSIONS.ROLE_UPDATE), validate(updateRoleSchema), roleController.update);
router.delete('/:id', verifyToken, authorize(PERMISSIONS.ROLE_DELETE), validate(getRoleByIdSchema), roleController.delete);

export default router;
export const roleRouter = router;
