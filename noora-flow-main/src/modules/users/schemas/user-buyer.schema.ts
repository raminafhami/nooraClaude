import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { Buyer } from './buyer.schema';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';

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
})
export class UserBuyer extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  public userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: Buyer.name,
  })
  public buyerId: string;

  @Prop({
    type: String,
    required: true,
  })
  public role: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  public isConnector: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  public isActive: boolean;

  @Prop({
    type:SchemaTypes.Types.ObjectId,
    required:false,
    ref :UserGroup.name
  })
  public branchId:string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
  })
  public createdBy: string;
}

export type UserBuyerDocument = UserBuyer & Document;

const UserBuyerSchema = SchemaFactory.createForClass(UserBuyer);

export { UserBuyerSchema };
