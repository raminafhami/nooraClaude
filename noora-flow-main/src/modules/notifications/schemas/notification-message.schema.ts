import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { NotificationPriority } from '../enums';
import { Notification } from './notification.schema';

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class NotificationMessage extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
  })
  category: string;

  @Prop({
    type: String,
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: string;

  @Prop({ type: Date, default: null })
  readedAt: Date;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Notification.name,
    required: true,
  })
  notificationId: string;
}
export type NotificationMessageDocument = NotificationMessage & Document;

export const NotificationMessageSchema =
  SchemaFactory.createForClass(NotificationMessage);
