import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { Buyer } from 'src/modules/users/schemas/buyer.schema';
import { User } from 'src/modules/users/schemas/user.schema';

export enum PaymentRuleType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum PaymentRuleMethod {
  TOTAL = 'total',
  REMAINING = 'remaining',
}

export enum PaymentRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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
export class PaymentRule extends Document {
  @Prop({
    type: String,
    required: true,
  })
  service: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    enum: PaymentRuleType,
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: PaymentRuleStatus,
    required: true,
  })
  status: string;

  @Prop({
    type: String,
    enum: PaymentRuleMethod,
    required: true,
  })
  method: string;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: [SchemaTypes.Types.Mixed],
    default: [],
  })
  cases: any[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  buyerId: string;
}
export type PaymentRuleDocument = PaymentRule & Document;

const PaymentRuleSchema = SchemaFactory.createForClass(PaymentRule);

PaymentRuleSchema.virtual('buyer', {
  ref: Buyer.name,
  localField: 'buyerId',
  foreignField: '_id',
  options: { projection: '_id name metadata' },
  justOne: true,
});

export { PaymentRuleSchema };
