import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export enum ExpertiseType {
  CERTIFICATE = 'certificate',
  SKILL = 'skill',
  KNOWLEDGE = 'knowledge',
}

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
export class Expertise extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    enum: ExpertiseType,
    required: true,
  })
  type: string;
}
export type ExpertiseDocument = Expertise & Document;

export const ExpertiseSchema = SchemaFactory.createForClass(Expertise);
