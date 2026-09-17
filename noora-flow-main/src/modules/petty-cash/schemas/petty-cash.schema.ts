import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { Category } from 'src/modules/categories/entity/category.schema';
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
export class PettyCash extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: Number,
    required: true,
  })
  amount: number;

  @Prop({
    type: Number,
    required: true,
  })
  remain: number;

  @Prop({
    type: [SchemaTypes.Types.ObjectId],
    ref: Category.name,
    required: true,
  })
  categoryIds: string[];

  @Prop({
    type: String,
    required: false,
  })
  bankShebaNumber: string;

  @Prop({
    type: String,
    required: false,
  })
  bankCardNumber: string;

  @Prop({
    type: [String],
    required: false,
  })
  files: string[];

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;
}
export type PettyCashDocument = PettyCash & Document;

const PettyCashSchema = SchemaFactory.createForClass(PettyCash);

export { PettyCashSchema };
