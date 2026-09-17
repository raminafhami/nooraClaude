import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as mSchema } from 'mongoose';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';

@Schema({
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
class PricesList {
  @Prop({
    type: String,
    required: true,
  })
  amount: string;

  @Prop({ type: Number, required: true })
  price: number;
}

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
export class SamplingPrice extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop([PricesList])
  pricesList: PricesList[];

  @Prop({ type: mSchema.Types.ObjectId, ref: UserGroup.name, required: true })
  branchId: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;
}
export type SamplingPriceDocument = SamplingPrice & Document;

export const SamplingPriceSchema = SchemaFactory.createForClass(SamplingPrice);
