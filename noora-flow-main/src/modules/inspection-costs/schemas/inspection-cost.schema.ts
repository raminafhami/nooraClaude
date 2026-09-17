import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { currencies } from 'src/common/const/enums';
import { CategoryBudget } from 'src/modules/category-budget/schemas/category-budget.schema';
import { PaymentRule } from 'src/modules/payment-rule/schemas/payment-rule.schema';
import { ProcessInstance } from 'src/modules/process-instances/schemas/process-instances.schema';
import { User } from 'src/modules/users/schemas/user.schema';

export enum InspectionCostCaseStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially-paid',
  PAID = 'paid',
}

export enum InspectionCostType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum InspectionCostMethod {
  TOTAL = 'total',
  REMAINING = 'remaining',
}

export enum InspectionCostStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  PAID = 'paid',
}

export enum InspectionCostPeriod {
  ANY = 'any',
  AFTER = 'after',
}

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      ret.instance = {
        name: ret.instance?.name,
        status: ret.instance?.status,
        buyer: ret.instance?.parameters?.Buyer || null,
      };
      delete ret?.payment?.instance;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      ret.instance = {
        name: ret.instance?.name,
        status: ret.instance?.status,
        buyer: ret.instance?.parameters?.Buyer || null,
      };
      delete ret?.payment?.instance;
      return ret;
    },
  },
})
export class InspectionCost extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: ProcessInstance.name,
    required: true,
  })
  caseId: string;

  @Prop({
    type: String,
    required: true,
  })
  caseNo: string;

  @Prop({
    type: String,
    enum: InspectionCostCaseStatus,
    required: false,
  })
  caseStatus?: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  personId: string;

  @Prop({
    type: String,
    required: false,
  })
  personName: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: PaymentRule.name,
    required: false,
  })
  ruleId: string;

  @Prop({
    type: String,
    enum: InspectionCostType,
    required: false,
  })
  type: string;

  @Prop({
    type: String,
    enum: InspectionCostMethod,
    required: false,
  })
  method: string;

  @Prop({
    type: String,
    required: false,
  })
  amount: string;

  @Prop({
    type: String,
    required: true,
  })
  total: string;

  @Prop({
    type: String,
    enum: InspectionCostPeriod,
    required: false,
  })
  period: string;

  @Prop({
    type: String,
    enum: InspectionCostStatus,
    required: true,
    default: InspectionCostStatus.UNPAID,
  })
  status: string;

  @Prop({
    type: String,
    required: false,
    default: '',
  })
  description: string;

  @Prop({
    type: {
      _id: false,
      caseId: {
        type: SchemaTypes.Types.ObjectId,
        ref: ProcessInstance.name,
        required: false,
      },
      caseNo: {
        type: String,
        required: false,
      },
      vouchers: {
        type: [{ voucherNo: Number, date: Date }],
        required: false,
        default: [],
        _id: false,
      },
    },
    default: null,
  })
  payment: {
    caseId: string;
    caseNo: string;
    vouchers: { voucherNo: number; date: Date }[];
  };
  @Prop({
    type: String,
    enum: currencies,
    default: currencies.Rial,
    required: true,
  })
  currency: string;

  @Prop({
    type: Number,
    default: 1,
    required: true,
  })
  currencyRate: number;

  @Prop({
    type: Number,
    required: false,
  })
  initialCurrencyRate?: number;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  categoryId: SchemaTypes.Types.ObjectId;

  // @Prop({
  //   type: SchemaTypes.Types.ObjectId,
  //   required: true,
  //   ref: CategoryBudget.name,
  // })
  // categoryBudgetId: string;
}
export type InspectionCostDocument = InspectionCost & Document;
const InspectionCostSchema = SchemaFactory.createForClass(InspectionCost);

InspectionCostSchema.virtual('person', {
  ref: User.name,
  localField: 'personId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username branchId',
  },
  justOne: true,
});

InspectionCostSchema.virtual('rule', {
  ref: PaymentRule.name,
  localField: 'rule',
  foreignField: '_id',
  // options: {
  //   projection: '_id name lastname username branchId',
  // },
  justOne: true,
});

InspectionCostSchema.virtual('instance', {
  ref: ProcessInstance.name,
  localField: 'caseId',
  foreignField: '_id',
  options: {
    projection: '_id name status parameters',
  },
  justOne: true,
});

export { InspectionCostSchema };
