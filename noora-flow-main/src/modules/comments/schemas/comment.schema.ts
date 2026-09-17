import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
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
})
export class Comments extends Document {
  @Prop({
    type: String,
    required: true,
  })
  text: string;

  @Prop({
    type: Types.ObjectId,
    ref: "ProjectTask.name",
    required: false,
  })
  projectTaskId?: string

  @Prop({
    type: Types.ObjectId,
    ref: "Comments.name",
    required: false
  })
  parentId?: string
  @Prop({
    type: Date,
    required: true,
    default: () => new Date()
  })
  createdAt: Date
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name
  })
  createdBy: string
  @Prop({
    type: Date,
    required: false,
  })
  modifiedAt: Date;
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: false
  })
  modifiedBy: string
}
export type CommentsDocument = Comments & Document;
export const CommentsSchema = SchemaFactory.createForClass(Comments);
