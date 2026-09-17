import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
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
  versionKey: false,
  timestamps: true,
})
export class InspectionFile extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  processInstanceId: string;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  category: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}

export type InspectionFileDocument = InspectionFile & Document;
export const InspectionFileSchema =
  SchemaFactory.createForClass(InspectionFile);
