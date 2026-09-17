import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Form } from './form.schema';

export enum SubmissionStatus {
  END = 'قطع همکاری',
  CONTINUE = 'ادامه همکاری',
  TRAIN = 'نیاز به آموزش',
}
@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.form) delete ret.formId;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.form) delete ret.formId;
      return ret;
    },
  },
})
export class Submission extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'Form',
    required: true,
  })
  public formId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public evaluatorId: string;

  @Prop({
    type: SchemaTypes.Types.Mixed,
    required: true,
    default: {},
  })
  public data: Record<string, unknown>;

  @Prop({
    type: Number,
  })
  public avgScore: number;

  @Prop({
    type: String,
  })
  public status: SubmissionStatus;
}

const SubmissionSchema = SchemaFactory.createForClass(Submission);
SubmissionSchema.virtual('form', {
  ref: 'Form',
  localField: 'formId',
  foreignField: '_id',
  options: {
    projection: '_id title certificateCode',
  },
  justOne: true,
});
export type SubmissionDocument = Submission & Document;
export { SubmissionSchema };
