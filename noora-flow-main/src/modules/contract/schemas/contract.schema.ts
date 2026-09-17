import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { JobDescription } from 'src/modules/job-description/schemas/job-description.schema';
import { User } from 'src/modules/users/schemas/user.schema';

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SIGNED = 'signed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

@Schema()
export class ContractApprover extends Document {
  @Prop({ type: String, required: false })
  key: string;

  @Prop({ type: String, required: false })
  title: string;

  @Prop({ type: Boolean, required: false })
  isProxy: boolean;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: true, ref: User.name })
  userId: SchemaTypes.Types.ObjectId;
}

export const ContractApproverSchema =
  SchemaFactory.createForClass(ContractApprover);

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.user) {
        delete ret.userId;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.user) {
        delete ret.userId;
      }
      return ret;
    },
  },
})
export class Contract extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  contractNo: string;

  @Prop({
    type: String,
    required: true,
  })
  damages: string;

  @Prop({
    type: Date,
    required: true,
  })
  signDate: Date;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: JobDescription.name }],
    default: [],
  })
  jobs: string[];

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;

  @Prop({
    type: Number,
    required: true,
  })
  period: number;

  @Prop({
    type: String,
    required: true,
  })
  salaryType: string;

  @Prop({
    type: Number,
    required: true,
  })
  salaryAmount: number;

  @Prop({
    type: String,
    required: true,
  })
  workplace: string;

  @Prop({
    type: String,
    required: true,
  })
  bankAccountNumber: string;

  @Prop({
    type: String,
    required: true,
  })
  bankName: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  bankBranch: string;

  @Prop({
    type: String,
    enum: ContractStatus,
    required: true,
  })
  status: string;

  @Prop({
    type: [ContractApproverSchema],
    required: false,
    default: [],
  })
  approvers?: ContractApprover[];
}
export type ContractDocument = Contract & Document;

const ContractSchema = SchemaFactory.createForClass(Contract);

ContractSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  options: {
    projection:
      '_id name lastname username nationalCode email phoneNo branchId',
  },
  justOne: true,
});

export { ContractSchema };
