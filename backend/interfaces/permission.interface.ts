import { Document, Types } from 'mongoose';

export interface IPermission extends Document {
  code: string;
  name: string;
  module: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  deleted: boolean;
}
