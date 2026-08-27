import { Document, Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  scope: string;
  permissions: Types.ObjectId[] | any[];
  isSystem: boolean;
  isActive: boolean;
  deleted: boolean;
}
