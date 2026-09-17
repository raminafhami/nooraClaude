import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export enum UserFileStatus {
  CONFIRM = 'confirm',
  PENDING = 'pending',
  REJECT = 'reject',
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
})
export class UserFile extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: 'User',
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  key: string;

  @Prop({
    type: String,
    required: true,
    enum: UserFileStatus,
  })
  status: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    default: null,
  })
  createBy: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    default: null,
  })
  modifyBy: string;

  @Prop({
    type: Date,
    default: null,
  })
  modifyAt: Date;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  createAt: Date;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type UserFileDocument = UserFile & Document;

const UserFileSchema = SchemaFactory.createForClass(UserFile);

export { UserFileSchema };
