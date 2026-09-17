import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { CategoryTypes } from 'src/common/const/enums';

@Schema({
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Category extends Document {
  @Prop({ type: String, enum: CategoryTypes, required: true })
  type: string;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  code: string;

  @Prop({ type: String, unique: false, trim: true, required: false })
  key?: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: Category.name,
  })
  parentId?: string;

  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false, required: true })
  isHidden: boolean;
}
export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ type: 1, code: 1 }, { unique: true });
