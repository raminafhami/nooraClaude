import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes, Types } from 'mongoose';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.approver) delete ret.approverId;
      if (ret?.seconder) delete ret.seconderId;
      if (ret?.producer) delete ret.producerId;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.approver) delete ret.approverId;
      if (ret?.seconder) delete ret.seconderId;
      if (ret?.producer) delete ret.producerId;
      return ret;
    },
  },
})
export class Audit extends Document {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  changeDescription: string;

  @Prop({
    type: String,
    required: true,
  })
  category: string;

  @Prop({
    type: String,
    required: true,
  })
  reviewNumber: string;

  @Prop({
    type: String,
    required: true,
  })
  auditNo: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  state: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
  })
  producerId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
  })
  seconderId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
  })
  approverId: string;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  date: Date;

  @Prop({
    type: [{ type: Types.ObjectId, ref: User.name }],
    default: [],
    required: false,
  })
  users?: string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: UserGroup.name }],
    default: [],
    required: false,
  })
  userGroups?: string[];
}
export type AuditDocument = Audit & Document;

const AuditSchema = SchemaFactory.createForClass(Audit);
AuditSchema.virtual('approver', {
  ref: User.name,
  localField: 'approverId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username branchId',
  },
  justOne: true,
});
AuditSchema.virtual('seconder', {
  ref: User.name,
  localField: 'seconderId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username branchId',
  },
  justOne: true,
});
AuditSchema.virtual('producer', {
  ref: User.name,
  localField: 'producerId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username branchId',
  },
  justOne: true,
});
export { AuditSchema };
