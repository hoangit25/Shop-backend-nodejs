import { Request } from 'express';
import { Document } from 'mongoose';

export interface AuthRequest extends Request {
  user?: Document & {
    _id: any;
    email: string;
    fullName: string;
    roles: any[];
    permissionOverrides: any[];
    isActive: boolean;
    deleted: boolean;
    toObject: () => any;
    comparePassword: (password: string) => Promise<boolean>;
  };
}
