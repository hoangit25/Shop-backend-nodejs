import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlacklistedToken extends Document {
  jti: string;
  userId?: Types.ObjectId;
  reason?: string;
  expiresAt: Date;
  createdAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      default: 'LOGOUT',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const BlacklistedTokenModel = mongoose.model<IBlacklistedToken>(
  'BlacklistedToken',
  blacklistedTokenSchema,
  'BlacklistedTokens'
);

export default BlacklistedTokenModel;
