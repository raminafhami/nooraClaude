import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

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
export class Indicator extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: Number,
    default: 1,
  })
  counter: number;

  @Prop({
    type: String,
    required: true,
  })
  format: string;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  key: string;
}
export type IndicatorDocument = Indicator & Document;

export const IndicatorSchema = SchemaFactory.createForClass(Indicator);
