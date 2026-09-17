import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { CostTypes, currencies, PettyCostStatus } from 'src/common/const/enums';
import { Category } from 'src/modules/categories/entity/category.schema';
import { CategoryBudget } from 'src/modules/category-budget/schemas/category-budget.schema';
import { PettyCash } from 'src/modules/petty-cash/schemas/petty-cash.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  timestamps: true,
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
export class PettyCost extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  userId: string;

  @Prop({
    type: String,
    enum: CostTypes,
    required: true,
  })
  type: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: function (this: PettyCost) {
      return this.type === CostTypes.Official;
    },
    ref: CategoryBudget.name,
  })
  categoryBudgetId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: Category.name,
  })
  categoryId: string;

  @Prop([
    {
      pettyCashId: {
        type: SchemaTypes.Types.ObjectId,
        ref: PettyCash.name,
        required: true,
      },
      amount: { type: Number, required: true },
    },
  ])
  pettyCashInfo: {
    pettyCashId: string;
    amount: number;
  }[];

  @Prop({
    type: String,
    required: false,
  })
  sellerNationalCode: string;

  @Prop({
    type: String,
    required: true,
    enum: currencies,
  })
  currency: string;

  @Prop({
    type: Number,
    required: true,
  })
  currencyRate: number;

  @Prop({
    type: Number,
    required: true,
  })
  total: number;

  @Prop({
    type: Number,
    default: 0,
  })
  amount: number;

  @Prop({
    type: Number,
    required: false,
  })
  vat?: number;

  @Prop({
    type: String,
    required: false,
  })
  invoiceNumber: string;

  @Prop({
    type: Date,
    required: false,
  })
  spentDate: string;

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: String,
    enum: PettyCostStatus,
    default: PettyCostStatus.UNPAID,
  })
  status: String;

  @Prop({
    type: [String],
    required: false,
  })
  files?: string[];
}
export type PettyCostDocument = PettyCost & Document;

const PettyCostSchema = SchemaFactory.createForClass(PettyCost);

export { PettyCostSchema };
