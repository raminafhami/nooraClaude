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
export class AssetRequirementFile extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: 'AssetRequirement',
  })
  assetId: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type AssetRequirementFileDocument = AssetRequirementFile & Document;

export const AssetRequirementFileSchema =
  SchemaFactory.createForClass(AssetRequirementFile);
