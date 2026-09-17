import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';

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
export class ProductCategory extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;
}
export type ProductCategoryDocument = ProductCategory & Document;

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
