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
export class CompanyFile extends Document {
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
    type: Date,
    required: true,
  })
  date: Date;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type CompanyFileDocument = CompanyFile & Document;

const CompanyFileSchema = SchemaFactory.createForClass(CompanyFile);

export { CompanyFileSchema };
