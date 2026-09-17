import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Types,
  Schema as SchemaTypes,
} from 'mongoose';
import { Expertise } from 'src/modules/expertise/schemas/expertise.schema';

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
export class PersonnelCertificate extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
  })
  userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: Expertise.name,
  })
  expertiseId: string;

  @Prop({
    type: String,
    required: true,
  })
  organizationName: string;

  @Prop({
    type: Date,
    default: null,
  })
  certificateDate: Date;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type PersonnelCertificateDocument = PersonnelCertificate & Document;

export const PersonnelCertificateSchema =
  SchemaFactory.createForClass(PersonnelCertificate);
