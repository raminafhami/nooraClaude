import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  versionKey: false,
  timestamps: true,
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
export class FormCategory extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  public title: string;

  // Protects the default seeded categories (بازرسی/منابع انسانی/...) from
  // deletion, while still allowing admins to add their own categories freely.
  @Prop({
    type: Boolean,
    default: false,
  })
  public isSystem: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  public createdBy: string;
}

export type FormCategoryDocument = FormCategory & Document;
export const FormCategorySchema = SchemaFactory.createForClass(FormCategory);
