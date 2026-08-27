import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import 'dotenv/config';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT Secret variables are not fully defined in environment variables."
  );
}

interface UserPayload {
  _id: any;
  email: string;
}

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  jti: string;
}

export const generateAccessToken = (user: UserPayload): { accessToken: string; jti: string } => {
  const jti = crypto.randomUUID();
  const payload = {
    id: String(user._id),
    email: user.email,
    jti,
  };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "15m" });
  return { accessToken, jti };
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const decodeAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.decode(token) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const generateRefreshToken = (user: UserPayload): string => {
  const payload = {
    id: String(user._id),
    email: user.email,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

