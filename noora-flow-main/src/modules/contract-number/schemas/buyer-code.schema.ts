import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { Buyer } from 'src/modules/users/schemas/buyer.schema';

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
  timestamps: true,
})
export class BuyerCode extends Document {
  @Prop({
    type: String,
    index: true,
    required: true,
  })
  code: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: Buyer.name,
  })
  buyerId: string;

  @Prop({
    type: Number,
    required: true,
    default: 1000,
  })
  counter: number;
}
export type BuyerCodeDocument = BuyerCode & Document;

const BuyerCodeSchema = SchemaFactory.createForClass(BuyerCode);

export { BuyerCodeSchema };
