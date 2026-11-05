import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as mSchema } from 'mongoose';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { User } from 'src/modules/users/schemas/user.schema';

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

// One price of a service; the price in force on a date is the one with the
// latest effectiveFrom on or before that date.
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
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
export class SamplingPriceVersion {
  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Date, required: true })
  effectiveFrom: Date;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: mSchema.Types.ObjectId, ref: User.name, default: null })
  createdBy?: string;
}

const SamplingPriceVersionSchema =
  SchemaFactory.createForClass(SamplingPriceVersion);

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
export class SamplingPrice extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  // sampling process keys the service is offered in; empty = all of them
  @Prop({ type: [String], default: [] })
  processKeys: string[];

  @Prop({ type: [SamplingPriceVersionSchema], default: [] })
  prices: SamplingPriceVersion[];

  // the service is not offered for samplings on or after this date
  @Prop({ type: Date, default: null })
  deprecatedFrom: Date | null;

  // legacy per-sample-count price list
  @Prop([PricesList])
  pricesList: PricesList[];

  @Prop({ type: mSchema.Types.ObjectId, ref: UserGroup.name, required: false })
  branchId?: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isDeleted: boolean;
}
export type SamplingPriceDocument = SamplingPrice & Document;

export const SamplingPriceSchema = SchemaFactory.createForClass(SamplingPrice);
