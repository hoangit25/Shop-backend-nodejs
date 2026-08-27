import { Request } from 'express';
import { Document } from 'mongoose';

export interface AuthRequest extends Request {
  user?: any;
}
