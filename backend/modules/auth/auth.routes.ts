import { Router } from 'express';
import * as authController from './auth.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import * as authSchemaZod from './auth.validation';

const router = Router();

// Public auth endpoints
router.post('/register', validate(authSchemaZod.registerSchema), authController.registerUser);
router.post('/login', validate(authSchemaZod.loginSchema), authController.loginUser);
router.post('/refresh', authController.refreshToken);

// Protected auth & session management endpoints
router.post('/logout', verifyToken, authController.logoutUser);
router.get('/sessions', verifyToken, authController.getSessions);
router.delete('/sessions/other', verifyToken, authController.revokeAllOtherSessions);
router.delete('/sessions/:sessionId', verifyToken, authController.revokeSession);
router.get('/audit-logs', verifyToken, authController.getAuditLogs);

export const authRouter = router;
