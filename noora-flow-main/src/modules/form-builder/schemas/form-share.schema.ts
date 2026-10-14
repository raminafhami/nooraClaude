import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormResponse } from './form-response.schema';

// A share only ever points at the original completed response - it never
// copies answers/signature, so the recipient always sees the live original
// record (read-only) and can never cause it to diverge (spec 18: "رکورد
// ارسالی به همان رکورد اصلی اشاره کند").
@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
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
export class FormShare extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormResponse.name,
    required: true,
  })
  public responseId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public sharedBy: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public sharedWith: string;

  @Prop({
    type: String,
    default: null,
  })
  public message: string;
}

export type FormShareDocument = FormShare & Document;
export const FormShareSchema = SchemaFactory.createForClass(FormShare);

FormShareSchema.virtual('sender', {
  ref: User.name,
  localField: 'sharedBy',
  foreignField: '_id',
  options: { projection: '_id name lastname username' },
  justOne: true,
});

FormShareSchema.virtual('recipient', {
  ref: User.name,
  localField: 'sharedWith',
  foreignField: '_id',
  options: { projection: '_id name lastname username' },
  justOne: true,
});
