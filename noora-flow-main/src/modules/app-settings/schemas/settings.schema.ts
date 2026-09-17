import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

@Schema({
  versionKey: false,
  minimize: false,
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
export class Setting extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public key: string;

  @Prop({
    type: SchemaTypes.Types.Mixed,
    required: true,
  })
  public value: any;
}

export type SettingDocument = Setting & Document;
export const SettingSchema = SchemaFactory.createForClass(Setting);
