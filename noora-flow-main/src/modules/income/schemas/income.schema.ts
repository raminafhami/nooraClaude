import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mSchema } from 'mongoose';
import {
  currencies,
  IncomeStatuses,
  IncomeTypes,
  UnitMeasure,
} from 'src/common/const/enums';
import { Category } from 'src/modules/categories/entity/category.schema';
import { InspectionCost } from 'src/modules/inspection-costs/schemas/inspection-cost.schema';
import { ProcessInstance } from 'src/modules/process-instances/schemas/process-instances.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      return ret;
    },
  },
  timestamps: true,
})
export class Income extends Document {
  @Prop({
    type: mSchema.Types.ObjectId,
    ref: ProcessInstance.name,
    required: false,
  })
  instanceId?: mSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: false,
  })
  caseNo?: string;

  @Prop({
    type: mSchema.Types.ObjectId,
    ref: InspectionCost.name,
    required: false,
  })
  costId?: mSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({
    enum: IncomeStatuses,
    default: IncomeStatuses.Unpaid,
    required: true,
  })
  status: string;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({ type: String, enum: currencies, required: true })
  currency: string;

  @Prop({
    type: Number,
    default: 1,
    required: true,
  })
  currencyRate: number;

  @Prop({ type: Number, default: 1, required: true })
  quantity: number;

  @Prop({ type: String, enum: UnitMeasure })
  unit: string;

  @Prop({ type: Number, required: true, default: 0 })
  discount: number;

  @Prop({ type: Number, required: true, default: 0 })
  additionalFee: number;

  @Prop({ type: Number, required: true, default: 0 })
  tax: number;

  @Prop({ type: Number, required: true, default: 0 })
  duty: number;

  @Prop({ type: Number, default: 1, required: true })
  total: number;

  @Prop({ type: String, enum: IncomeTypes, required: true })
  type: string;

  @Prop({ type: mSchema.Types.ObjectId, required: true, ref: Category.name })
  categoryId: mSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: false, required: true })
  isDeleted: boolean;

  @Prop({ type: mSchema.Types.ObjectId, required: false })
  refIncomeId?: mSchema.Types.ObjectId;

  @Prop({ type: mSchema.Types.ObjectId, required: false, ref: User.name })
  createdBy: mSchema.Types.ObjectId;

  @Prop({ type: mSchema.Types.ObjectId, required: false, ref: User.name })
  updatedBy: mSchema.Types.ObjectId;

  @Prop({ type: Number, required: false })
  lock?: number;
}

const IncomeSchema = SchemaFactory.createForClass(Income);

export type IncomeDocument = Income & Document;

export { IncomeSchema };
