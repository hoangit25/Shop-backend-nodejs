import { Request, Response, NextFunction } from 'express';
import * as jwtConfig from '../config/jwt.config';
import UserModel from '../modules/user/user.model';
import BlacklistedTokenModel from '../modules/auth/models/blacklisted-token.model';
import { AppError } from '../common/AppError';

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.Unauthorized(
        'Access token is missing or invalid format',
        'MISSING_TOKEN'
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtConfig.verifyAccessToken(token);

    if (decoded.jti) {
      const isBlacklisted = await BlacklistedTokenModel.exists({ jti: decoded.jti });
      if (isBlacklisted) {
        throw AppError.Unauthorized(
          'Token has been revoked. Please log in again.',
          'TOKEN_REVOKED'
        );
      }
    }

    const user = await UserModel.findOne({
      _id: decoded.id,
      deleted: false,
    });

    if (!user) {
      throw AppError.Unauthorized(
        'User not found or has been deleted',
        'USER_NOT_FOUND'
      );
    }

    if (user.isActive === false) {
      throw AppError.Unauthorized(
        'User account is suspended',
        'ACCOUNT_SUSPENDED'
      );
    }

    (req as any).user = user;
    (req as any).token = token;
    (req as any).jti = decoded.jti;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : error);
  }
};

