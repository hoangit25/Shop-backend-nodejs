import * as jwtConfig from '../../config/jwt.config';
import { AppError } from '../../common/AppError';
import { AuthRepository, authRepository } from './auth.repository';
import SessionModel from './models/session.model';
import BlacklistedTokenModel from './models/blacklisted-token.model';
import { AuditLogService } from './services/audit-log.service';

export interface ClientContext {
  ipAddress?: string;
  userAgent?: string;
  currentToken?: string;
}

function parseDeviceName(userAgent: string = ''): string {
  if (!userAgent || userAgent === 'Unknown') return 'Unknown Device';
  
  let browser = 'Browser';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';

  let os = 'Unknown OS';
  if (userAgent.includes('Win')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}

export class AuthService {
  constructor(private repository: AuthRepository = authRepository) {}

  async register(userData: any, context?: ClientContext) {
    const { email, password, fullName } = userData;
    if (!email || !password || !fullName) {
      throw AppError.BadRequest('Missing required registration fields', 'MISSING_FIELDS');
    }

    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw AppError.Conflict('Email is already registered', 'EMAIL_REGISTERED');
    }

    const newUser = await this.repository.createNewUser(userData);

    await AuditLogService.record({
      userId: newUser._id,
      email: newUser.email,
      action: 'REGISTER_SUCCESS',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    const userObj = newUser.toObject();
    delete (userObj as any).password;
    return userObj;
  }

  async login(email: string, password: string, context?: ClientContext) {
    if (!email || !password) {
      throw AppError.BadRequest('Email and password are required', 'MISSING_CREDENTIALS');
    }

    const user = await this.repository.findByEmail(email);
    if (!user) {
      await AuditLogService.record({
        email,
        action: 'LOGIN_FAILED',
        status: 'FAILED',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        details: { reason: 'User not found' },
      });
      throw AppError.Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      await AuditLogService.record({
        userId: user._id,
        email,
        action: 'LOGIN_FAILED',
        status: 'FAILED',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        details: { reason: 'Account suspended' },
      });
      throw AppError.Forbidden('Your account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLogService.record({
        userId: user._id,
        email,
        action: 'LOGIN_FAILED',
        status: 'FAILED',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        details: { reason: 'Invalid password' },
      });
      throw AppError.Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const { accessToken, jti } = jwtConfig.generateAccessToken(user);
    const refreshToken = jwtConfig.generateRefreshToken(user);

    // Multi-Device Session Creation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days TTL

    const session = await SessionModel.create({
      userId: user._id,
      refreshToken,
      ipAddress: context?.ipAddress || 'Unknown',
      userAgent: context?.userAgent || 'Unknown',
      deviceName: parseDeviceName(context?.userAgent),
      isRevoked: false,
      expiresAt,
    });

    await AuditLogService.record({
      userId: user._id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      details: { sessionId: session._id, deviceName: session.deviceName },
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return {
      user: userObj,
      accessToken,
      refreshToken,
      sessionId: session._id,
    };
  }

  async verifyRefreshToken(refreshToken: string, context?: ClientContext) {
    if (!refreshToken) {
      throw AppError.BadRequest('Refresh token is required', 'MISSING_REFRESH_TOKEN');
    }

    let decoded: any;
    try {
      decoded = jwtConfig.verifyRefreshToken(refreshToken);
    } catch (error) {
      await AuditLogService.record({
        action: 'REFRESH_TOKEN_FAILED',
        status: 'FAILED',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        details: { reason: 'JWT verification failed' },
      });
      throw AppError.Unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Find active session matching this refresh token
    const session = await SessionModel.findOne({
      refreshToken,
      isRevoked: false,
    });

    if (!session) {
      await AuditLogService.record({
        userId: decoded.id,
        action: 'REFRESH_TOKEN_FAILED',
        status: 'WARNING',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        details: { reason: 'Session not found or revoked (Token Reuse Detected)' },
      });
      throw AppError.Forbidden(
        'Security Alert: Session has expired or token has been revoked. Please log in again.',
        'TOKEN_REUSE'
      );
    }

    const user = await this.repository.findByIdActive(decoded.id);
    if (!user || !user.isActive) {
      session.isRevoked = true;
      await session.save();
      throw AppError.Forbidden('User account is suspended or unavailable', 'ACCOUNT_SUSPENDED');
    }

    // Rotate Tokens for this specific session
    const { accessToken: newAccessToken } = jwtConfig.generateAccessToken(user);
    const newRefreshToken = jwtConfig.generateRefreshToken(user);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    session.refreshToken = newRefreshToken;
    session.ipAddress = context?.ipAddress || session.ipAddress;
    session.userAgent = context?.userAgent || session.userAgent;
    session.expiresAt = newExpiresAt;
    await session.save();

    await AuditLogService.record({
      userId: user._id,
      email: user.email,
      action: 'REFRESH_TOKEN_SUCCESS',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      details: { sessionId: session._id },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, refreshToken?: string, context?: ClientContext) {
    // 1. Revoke the device session if refreshToken provided
    if (refreshToken) {
      await SessionModel.updateOne(
        { refreshToken, userId },
        { $set: { isRevoked: true } }
      );
    }

    // 2. Blacklist current Access Token if provided
    if (context?.currentToken) {
      const decoded = jwtConfig.decodeAccessToken(context.currentToken);
      if (decoded?.jti) {
        const expDate = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);
        await BlacklistedTokenModel.create({
          jti: decoded.jti,
          userId: userObjectId(userId),
          reason: 'LOGOUT',
          expiresAt: expDate,
        }).catch(() => {}); // Ignore duplicate key errors if already blacklisted
      }
    }

    // 3. Record Audit Log
    if (userId) {
      await AuditLogService.record({
        userId,
        action: 'LOGOUT',
        status: 'SUCCESS',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
    }
  }

  async getUserSessions(userId: string) {
    return SessionModel.find({ userId, isRevoked: false })
      .select('_id ipAddress userAgent deviceName createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
  }

  async revokeSession(userId: string, sessionId: string, context?: ClientContext) {
    const session = await SessionModel.findOne({ _id: sessionId, userId });
    if (!session) {
      throw AppError.NotFound('Session not found', 'SESSION_NOT_FOUND');
    }

    session.isRevoked = true;
    await session.save();

    await AuditLogService.record({
      userId,
      action: 'SESSION_REVOKED',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      details: { revokedSessionId: sessionId, deviceName: session.deviceName },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllOtherSessions(userId: string, currentRefreshToken?: string, context?: ClientContext) {
    const query: any = { userId, isRevoked: false };
    if (currentRefreshToken) {
      query.refreshToken = { $ne: currentRefreshToken };
    }

    const result = await SessionModel.updateMany(query, { $set: { isRevoked: true } });

    await AuditLogService.record({
      userId,
      action: 'ALL_OTHER_SESSIONS_REVOKED',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      details: { revokedCount: result.modifiedCount },
    });

    return { message: `Revoked ${result.modifiedCount} other active sessions` };
  }

  async getAuditLogs(userId: string, limit = 50) {
    return AuditLogService.getUserLogs(userId, limit);
  }
}

function userObjectId(id: string) {
  try {
    return new (require('mongoose').Types.ObjectId)(id);
  } catch {
    return undefined;
  }
}

export const authService = new AuthService();
