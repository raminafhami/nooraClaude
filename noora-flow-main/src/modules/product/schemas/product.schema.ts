import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { ProductCategory } from 'src/modules/product-category/schemas/product-category.schema';
export interface IStock {
  quantity: number;
  startIndex: number;
  endIndex: number;
}

@Schema({
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) {
        delete ret.categoryId;
      }
      ret.stockQuantity = ret?.stock?.reduce((acc, cur) => {
        return acc + cur.quantity;
      }, 0);
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) {
        delete ret.categoryId;
      }
      ret.stockQuantity = ret?.stock?.reduce((acc, cur) => {
        return acc + cur.quantity;
      }, 0);
      return ret;
    },
  },
})
class Stock {
  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  startIndex: number;

  @Prop({ type: Number, required: true })
  endIndex: number;

  @Prop({
    type: Number,
    default: 1,
  })
  counter: number;
}
@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) {
        delete ret.categoryId;
      }
      ret.stockQuantity = ret?.stock?.reduce((acc, cur) => {
        return acc + cur.quantity;
      }, 0);
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) {
        delete ret.categoryId;
      }
      ret.stockQuantity = ret?.stock?.reduce((acc, cur) => {
        return acc + cur.quantity;
      }, 0);
      return ret;
    },
  },
})
export class Product extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: ProductCategory.name,
    required: true,
  })
  categoryId: string;

  @Prop([Stock])
  stock: Stock[];

  @Prop({ type: Number, required: true })
  alertThreshold: number;
}
export type ProductDocument = Product & Document;

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('category', {
  ref: ProductCategory.name,
  localField: 'categoryId',
  foreignField: '_id',
  options: {
    projection: '_id name',
  },
  justOne: true,
});

export { ProductSchema };
