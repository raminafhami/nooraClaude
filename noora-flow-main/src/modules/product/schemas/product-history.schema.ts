import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { Product } from './product.schema';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.branch) {
        delete ret.branchId;
      }
      if (ret?.product) {
        delete ret.productId;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.branch) {
        delete ret.branchId;
      }
      if (ret?.product) {
        delete ret.productId;
      }
      return ret;
    },
  },
})
export class ProductHistory extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  productId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: UserGroup.name,
    required: true,
  })
  branchId: string;

  @Prop({
    type: Number,
    required: true,
  })
  from: number;

  @Prop({
    type: Number,
    required: true,
  })
  to: number;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  date: Date;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({
    type: [Number],
    required: true,
    default: [],
  })
  unUsedCodes: number[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
    default: null,
  })
  createdBy: string;
}
export type ProductHistoryDocument = ProductHistory & Document;

const ProductHistorySchema = SchemaFactory.createForClass(ProductHistory);

ProductHistorySchema.virtual('product', {
  ref: Product.name,
  localField: 'productId',
  foreignField: '_id',
  options: {
    projection: '_id name',
  },
  justOne: true,
});

ProductHistorySchema.virtual('branch', {
  ref: UserGroup.name,
  localField: 'branchId',
  foreignField: '_id',
  options: {
    projection: '_id name title',
  },
  justOne: true,
});

export { ProductHistorySchema };
