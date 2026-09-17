import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from './user.schema';
import { ProcessInstance } from 'src/modules/process-instances/schemas/process-instances.schema';

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
export class Debt extends Document {
  @Prop({
    type: Number,
    required: true,
  })
  public amount: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  public isPaid: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  public userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: ProcessInstance.name,
  })
  public instanceId: string;

  @Prop({
    type: String,
    required: false,
  })
  caseNo?: string

  @Prop({
    type: String,
    required: false,
  })
  userType?: string
}

export type DebtDocument = Debt & Document;

const DebtSchema = SchemaFactory.createForClass(Debt);

DebtSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
export { DebtSchema };
