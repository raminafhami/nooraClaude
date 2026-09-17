import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

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
export class SubContractor extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  reasonAssignment: string;

  @Prop({
    type: Date,
    required: true,
  })
  evaluationDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  nextEvaluationDate: Date;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type SubContractorDocument = SubContractor & Document;

export const SubContractorSchema = SchemaFactory.createForClass(SubContractor);
