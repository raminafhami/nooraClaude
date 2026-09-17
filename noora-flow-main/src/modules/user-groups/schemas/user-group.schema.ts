import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { Permission } from 'src/modules/permissions/schemas/permission.schema';

export enum USER_GROUP_TYPE {
  ROLE = 'role',
  SECTION = 'section',
  BRANCH = 'branch',
  GROUP = 'group',
}
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
export class UserGroup extends Document {
  @Prop({
    type: String,
    required: true,
  })
  public title: string;

  @Prop({
    type: String,
    required: true,
  })
  public name: string;

  @Prop({
    type: String,
    enum: USER_GROUP_TYPE,
    required: true,
  })
  public type: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    default: null,
  })
  public parentId: string;

  @Prop({ type: SchemaTypes.Types.Mixed, required: false })
  public metadata: any;

  @Prop({
    type: [{ type: String, ref: Permission.name }],
    required: true,
    default: [],
  })
  public permissions: string[];
}

export type UserGroupDocument = UserGroup & Document;

const UserGroupSchema = SchemaFactory.createForClass(UserGroup);

// important => localField, foreignField in parent and children populate
UserGroupSchema.virtual('parent', {
  ref: UserGroup.name,
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

UserGroupSchema.virtual('children', {
  ref: UserGroup.name,
  localField: '_id',
  foreignField: 'parentId',
});

UserGroupSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'groups',
  // options: { projection: 'email' }, // sample
});

export { UserGroupSchema };
