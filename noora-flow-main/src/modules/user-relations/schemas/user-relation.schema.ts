import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

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
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class UserRelations extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
    default: null,
  })
  coordinatorId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
    default: null,
  })
  marketerId: string;

  @Prop({
    type: Date,
    required: false,
  })
  deactivatedAt?: Date;
}
export type UserRelationsDocument = UserRelations & Document;
const UserRelationsSchema = SchemaFactory.createForClass(UserRelations);

UserRelationsSchema.virtual('coordinator', {
  ref: 'User',
  localField: 'coordinatorId',
  foreignField: '_id',
  options: { projection: '_id name lastname' },
  justOne: true,
});

UserRelationsSchema.virtual('marketer', {
  ref: 'User',
  localField: 'marketerId',
  foreignField: '_id',
  options: { projection: '_id name lastname' },
  justOne: true,
});

export { UserRelationsSchema };
