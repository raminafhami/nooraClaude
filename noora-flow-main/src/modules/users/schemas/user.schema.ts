import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { ReferralSource } from 'src/common/const/enums';
import { Industry } from 'src/modules/industry/schemas/industry.schema';
import { UserFile } from 'src/modules/user-files/schemas/user-file.schema';
import {
  USER_GROUP_TYPE,
  UserGroup,
} from 'src/modules/user-groups/schemas/user-group.schema';

export enum UserTypes {
  SYSTEM = 'system',
  NORMAL = 'normal',
  PERSONNEL = 'personnel',
  REGULAR = 'regular',
}

export enum LoginTypes {
  OTP = 'otp',
  PASSWORD = 'password',
  ALL = 'all',
}
export interface EmailConfig {
  user: string;
  encryptedPassword: string;
}
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
class BankInfo {
  _id: SchemaTypes.Types.ObjectId;

  @Prop({
    type: String,
    required: false,
  })
  bankAccountNumber?: string;

  @Prop({
    type: String,
    required: true,
  })
  bankCardNumber: string;

  @Prop({
    type: String,
    required: true,
  })
  bankName: string;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  bankSheba?: string;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  bankAccountOwner?: string;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  bankBranch?: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;
}

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc: any, ret: any) {
      delete ret.password;
      delete ret.phoneValidated;
      delete ret.setPassword;
      delete ret.salt;
      delete ret.apiKey;
      delete ret._id;
      if (doc?.userFiles?.length > 0) {
        const avatarFile = doc.userFiles.find((file) => file.key === 'avatar');
        if (avatarFile) {
          ret.image = avatarFile;
        }
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret.password;
      delete ret.phoneValidated;
      delete ret.setPassword;
      delete ret.salt;
      delete ret.apiKey;
      delete ret._id;
      return ret;
    },
  },
  versionKey: false,
  timestamps: true,
})
export class User extends Document {
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
  public lastname: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  public username: string;

  @Prop({
    type: String,
    required: false,
  })
  public nationalCode: string;

  @Prop({
    type: String,
    trim: true,
    required: false,
  })
  public email: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  public phoneNo: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public password: string;

  @Prop({
    type: Boolean,
    default: false,
    required: false,
  })
  public phoneValidated: boolean;

  @Prop({
    type: Boolean,
    default: true,
    required: false,
  })
  public setPassword: boolean;

  @Prop({
    type: String,
    // enum: UserTypes,
    default: UserTypes.NORMAL,
  })
  public type: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: UserGroup.name }],
    default: [],
  })
  public groups: string[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: UserGroup.name,
    default: null,
  })
  public branchId: string;

  @Prop({ type: SchemaTypes.Types.Mixed, required: false })
  public metadata: any;

  @Prop([BankInfo])
  bankInfos: BankInfo[];

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  public bankAccountNumber?: string;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  public sepidarId: string;

  @Prop({
    type: Number,
    default: 50000000,
    required: true,
  })
  credit: number;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  public postalCode: string;

  @Prop({
    type: String,
    default: null,
    required: false,
  })
  public address: string;

  @Prop({
    type: Boolean,
    default: true,
    required: false,
  })
  public isActive: boolean;

  @Prop({
    type: String,
    enum: LoginTypes,
    default: LoginTypes.ALL,
  })
  public loginType: string;

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
    ref: User.name,
    required: false,
  })
  public createdBy?: string;

  @Prop({
    type: {
      user: String,
      encryptedPassword: String,
    },
    _id: false,
  })
  emailConfig?: EmailConfig;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  apiKey?: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  salt?: string;
}
export type UserDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('userFiles', {
  ref: UserFile.name,
  localField: '_id',
  foreignField: 'userId',
  options: { projection: '-mimetype -path' },
});

UserSchema.virtual('personnel', {
  ref: 'Personnel',
  localField: '_id',
  foreignField: 'userId',
});

export { UserSchema };
