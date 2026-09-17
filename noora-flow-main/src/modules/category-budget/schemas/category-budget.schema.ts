import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { Category } from 'src/modules/categories/entity/category.schema';

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
export class CategoryBudget extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  categoryId: string;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: Date,
    required: true,
  })
  dateFrom: Date;

  @Prop({
    type: Date,
    required: true,
  })
  dateTo: Date;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;
}
export type CategoryBudgetDocument = CategoryBudget & Document;

const categoryBudgetSchema = SchemaFactory.createForClass(CategoryBudget);

export { categoryBudgetSchema };
