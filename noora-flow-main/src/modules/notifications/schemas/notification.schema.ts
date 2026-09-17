import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { NotificationPriority } from '../enums';

export class Recipient {
  @Prop({ type: [String], default: [] })
  groups: string[];

  @Prop({ type: [String], default: [] })
  users: string[];
}

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
    updatedAt: 'modifiedAt',
  },
})
export class Notification extends Document {
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

  @Prop({ type: Recipient })
  recipient: Recipient;

  @Prop({
    type: String,
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPublished: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  modifiedBy: string;
}
export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
