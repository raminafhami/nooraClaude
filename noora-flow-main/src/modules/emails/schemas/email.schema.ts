import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { EmailStatus } from 'src/common/const/enums';
import { User } from 'src/modules/users/schemas/user.schema';

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
  timestamps: true,
})
export class Email extends Document {
  @Prop({
    type: String,
    required: false,
  })
  from?: string;

  @Prop({
    type: [String],
    required: true,
  })
  to: string[];

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  cc: string[];

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  bcc: string[];

  @Prop({
    type: String,
    required: true,
  })
  subject: string;

  @Prop({
    type: String,
    required: true,
  })
  body: string;

  @Prop({
    type: String,
    enum: EmailStatus,
    required: true,
  })
  status: EmailStatus;

  @Prop({ type: SchemaTypes.Types.Mixed })
  metadata: object;

  @Prop({ type: SchemaTypes.Types.ObjectId, ref: User.name, default: null })
  userId?: string;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;
}
export type EmailDocument = Email & Document;

export const EmailSchema = SchemaFactory.createForClass(Email);
