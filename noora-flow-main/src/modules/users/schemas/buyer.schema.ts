import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { IndustryTypes, ReferralSource } from 'src/common/const/enums';
import { Industry } from 'src/modules/industry/schemas/industry.schema';

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
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
  versionKey: false,
  timestamps: true,
})
export class Buyer extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public type: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  public userId: string;

  @Prop({
    type: String,
    max: 10,
  })
  public nationalCode: string;

  @Prop({
    type: String,
    trim: true,
  })
  public postalCode: string;

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  public contactNo: string[];

  @Prop({
    type: String,
    max: 200,
    trim: true,
  })
  public address: string;

  @Prop({ type: SchemaTypes.Types.Mixed, required: false })
  public metadata: any;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: UserGroup.name }],
    default: [],
  })
  public branches: string[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Industry.name,
    required: false,
  })
  public industryId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Industry.name,
    required: false,
  })
  public subIndustryId: string;

  @Prop({
    type: String,
    enum: ReferralSource,
    required: false,
  })
  public referralSource: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  public createdBy: string;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isDeleted?: true;
}
export type BuyerDocument = Buyer & Document;

const BuyerSchema = SchemaFactory.createForClass(Buyer);

BuyerSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
export { BuyerSchema };
