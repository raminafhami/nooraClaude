import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { Buyer } from 'src/modules/users/schemas/buyer.schema';
import { User } from 'src/modules/users/schemas/user.schema';
import { BuyerCode } from './buyer-code.schema';
import { Branch } from 'src/modules/branch/schemas/branch.schema';

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
  timestamps: true,
})
export class ContractNumber extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    index: true,
    required: true,
  })
  cn: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: Buyer.name,
  })
  buyerId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  customerId: string;

  @Prop({
    type: String,
    required: false,
  })
  proforma: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: true, ref: Branch.name })
  branchId: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;
}
export type ContractNumberDocument = ContractNumber & Document;

const ContractNumberSchema = SchemaFactory.createForClass(ContractNumber);

export { ContractNumberSchema };
