import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export enum CourseStatus {
  STARTED = 'started',
  NOT_STARTED = 'notStarted',
  ENDED = 'ended',
}

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.userList) {
        ret.users = ret.userList;
        delete ret.userList;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.userList) {
        ret.users = ret.userList;
        delete ret.userList;
      }
      return ret;
    },
  },
})
export class Course extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  instructor: string;

  @Prop({
    type: String,
    required: true,
  })
  place: string;

  @Prop({
    type: String,
    required: true,
  })
  time: string;

  @Prop({
    type: Number,
    required: false,
  })
  participantNo: number;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;

  @Prop({
    type: String,
    enum: CourseStatus,
    default: CourseStatus.NOT_STARTED,
  })
  status: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: User.name }],
    default: [],
  })
  users: string[];
}
export type CourseDocument = Course & Document;

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.virtual('userList', {
  ref: User.name,
  localField: 'users',
  foreignField: '_id',
  options: {
    projection:
      '_id name lastname username nationalCode email phoneNo branchId',
  },
});
