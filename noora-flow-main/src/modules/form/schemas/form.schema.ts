import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Submission } from './submission.schema';

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.evalUser) {
        ret.evaluator = ret.evalUser;
        delete ret.evalUser;
      }

      if (ret?.targetUsers) {
        ret.targetUsers.map((tg) => {
          if (tg?.user) {
            delete tg.userId;
          }
          if (tg?.submission) {
            delete tg.submissionId;
          }
          return tg;
        });
      }

      return ret;
    },
  },
  toObject: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.evalUser) {
        ret.evaluator = ret.evalUser;
        delete ret.evalUser;
      }

      if (ret?.targetUsers) {
        ret.targetUsers.map((tg) => {
          if (tg?.user) {
            delete tg.userId;
          }
          if (tg?.submission) {
            delete tg.submissionId;
          }
          return tg;
        });
      }

      return ret;
    },
  },
})
export class Form extends Document {
  @Prop({
    type: String,
    trim: true,
    required: true,
  })
  public title: string;

  @Prop({
    type: String,
    required: true,
  })
  public certificateCode: string;

  @Prop({
    type: String,
    required: true,
  })
  public formNo: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public evaluator: string;

  @Prop({
    type: [
      {
        _id: false,
        userId: { type: SchemaTypes.Types.ObjectId, ref: User.name },
        submissionId: {
          type: SchemaTypes.Types.ObjectId,
          ref: Submission.name,
          default: null,
        },
      },
    ],
    default: [],
  })
  public targetUsers: { userId: string; submissionId: string }[];

  @Prop({
    type: [{ title: String, questionId: String }],
    required: true,
  })
  public questions: {
    title: string;
    questionId: string;
  }[];

  @Prop({
    type: Number,
    required: true,
  })
  public startEvalNumber: number;

  @Prop({
    type: Number,
    required: true,
  })
  public endEvalNumber: number;

  @Prop({
    type: Date,
    default: null,
  })
  public endDate: Date;
}

export const FormSchema = SchemaFactory.createForClass(Form);
FormSchema.virtual('evalUser', {
  ref: User.name,
  localField: 'evaluator',
  foreignField: '_id',
  options: {
    projection:
      '_id name lastname username nationalCode email phoneNo branchId',
  },
  justOne: true,
});

FormSchema.virtual('targetUsers.user', {
  ref: User.name,
  localField: 'targetUsers.userId',
  foreignField: '_id',
  options: {
    projection:
      '_id name lastname username nationalCode email phoneNo branchId',
  },
  justOne: true,
});

FormSchema.virtual('targetUsers.submission', {
  ref: Submission.name,
  localField: 'targetUsers.submissionId',
  foreignField: '_id',
  options: {
    projection: '_id avgScore status',
  },
  justOne: true,
});

export type FormDocument = Form & Document;
