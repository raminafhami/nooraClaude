import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { JobDescription } from 'src/modules/job-description/schemas/job-description.schema';
import { PersonnelExpertise } from 'src/modules/personnel-expertise/schemas/personnel-expertise.schema';
import { User } from 'src/modules/users/schemas/user.schema';
import { WorkingTimeRegulation } from 'src/modules/working-time-regulations/schemas/working-time-regulation.schema';

export class AcademicType {
  @ApiProperty()
  @Prop({ type: String })
  level: string;

  @ApiProperty()
  @Prop({ type: String })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  field: string;
}
@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret.expertises) {
        ret.expertises.map((e) => {
          delete e.userId;
          e.title = e.expertiseId.title;
          e.type = e.expertiseId.type;
          e.expertiseId = e.expertiseId.id;
          return e;
        });
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret.expertises) {
        ret.expertises.map((e) => {
          delete e.userId;
          e.title = e.expertiseId.title;
          e.type = e.expertiseId.type;
          e.expertiseId = e.expertiseId.id;
          return e;
        });
      }
      return ret;
    },
  },
})
export class Personnel extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    unique: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: false,
  })
  personnelCode: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  internalPhoneNo: string;

  @Prop({
    type: String,
    required: false,
  })
  fatherName: string;

  @Prop({
    type: String,
    required: false,
  })
  birthCertificateNo: string;

  @Prop({
    type: String,
    required: false,
  })
  birthDate: string;

  @Prop({
    type: String,
    required: false,
  })
  birthPlace: string;

  @Prop([AcademicType])
  academics: AcademicType[];

  @Prop({
    type: String,
    required: false,
  })
  address: string;

  @Prop({
    type: String,
    required: false,
  })
  landlineNo: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: JobDescription.name }],
    required: false,
  })
  jobs: string[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: WorkingTimeRegulation.name,
    required: false,
    default: null,
  })
  workingTimeRegulationId?: string;

  @Prop({
    type: String,
    required: false,
  })
  maxExtraTime?: string;

  @Prop({
    type: Number,
    required: false,
  })
  maxDayLeave?: number;

  @Prop({
    type: Number,
    required: false,
    default: 3,
  })
  maxManualTime: number;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;
}
export type PersonnelDocument = Personnel & Document;

const PersonnelSchema = SchemaFactory.createForClass(Personnel);
PersonnelSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: {
    projection:
      'branchId name lastname username nationalCode email phoneNo bankCardNumber bankAccountOwner bankAccountNumber bankSheba bankName bankBranch bankInfos',
  },
});

PersonnelSchema.virtual('workingTimeRegulation', {
  ref: 'WorkingTimeRegulation',
  localField: 'workingTimeRegulationId',
  foreignField: '_id',
  justOne: true,
});

PersonnelSchema.virtual('expertises', {
  ref: PersonnelExpertise.name,
  localField: 'userId',
  foreignField: 'userId',
  options: {
    projection: 'expertiseId status data',
    populate: [
      {
        path: 'expertiseId',
        select: 'title type',
      },
      { path: 'data.certificate' },
    ],
  },
});
export { PersonnelSchema };
