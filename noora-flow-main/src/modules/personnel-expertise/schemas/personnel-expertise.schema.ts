import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Types,
  Schema as SchemaTypes,
} from 'mongoose';
import { Expertise } from 'src/modules/expertise/schemas/expertise.schema';
import { PersonnelCertificate } from './personnel-certificate.schema';

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.data?.certificate) {
        delete ret.data.certificateId;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.data?.certificate) {
        delete ret.data.certificateId;
      }
      return ret;
    },
  },
})
export class PersonnelExpertise extends Document {
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
  status: string;

  @Prop({
    type: SchemaTypes.Types.Mixed,
    required: false,
  })
  data: any;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    default: null,
  })
  modifyBy: string;

  @Prop({
    type: Date,
    default: null,
  })
  modifyAt: Date;
}
export type PersonnelExpertiseDocument = PersonnelExpertise & Document;

const PersonnelExpertiseSchema =
  SchemaFactory.createForClass(PersonnelExpertise);

PersonnelExpertiseSchema.virtual('data.certificate', {
  ref: PersonnelCertificate.name,
  localField: 'data.certificateId',
  foreignField: '_id',
  options: { projection: '_id organizationName certificateDate' },
  justOne: true,
});

export { PersonnelExpertiseSchema };
