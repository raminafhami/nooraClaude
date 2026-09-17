/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import {
  Date,
  Document,
  HydratedDocument,
  ObjectId,
  SchemaTypes,
  Schema as mSchema,
} from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export enum PERSONNEL_REQUEST_TYPE {
  DAILY_LEAVE = 'dailyLeave',
  HOURLY_MISSION = 'hourlyMission',
  DAILY_MISSION = 'dailyMission',
  HOURLY_LEAVE = 'hourlyLeave',
  EXTRA = 'extra',
}

export enum PERSONNEL_REQUEST_STATUS {
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  WAITING_CONFIRMATION = 'waitingConfirmation',
  COUNTED = 'counted',
}

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret.password;
      delete ret.phoneValidated;
      delete ret.setPassword;
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret.password;
      delete ret.phoneValidated;
      delete ret.setPassword;
      delete ret._id;
      return ret;
    },
  },
})
export class PersonnelRequest extends Document {
  @Prop({
    type: mSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  dateFrom: string;

  @Prop({
    type: String,
    required: true,
  })
  dateTo: string;

  @Prop({
    type: String,
    validate: {
      validator: function (value: string) {
        // Use the regex to validate the time format
        return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid time format (hh:mm:ss)`,
    },
  })
  timeFrom: string;

  @Prop({
    type: String,
    validate: {
      validator: function (value: string) {
        // Use the regex to validate the time format
        return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid time format (hh:mm:ss)`,
    },
  })
  timeTo: string;

  @Prop({
    type: String,
    enum: [
      'dailyLeave',
      'hourlyMission',
      'dailyMission',
      'hourlyLeave',
      'extra',
    ],
    required: true,
  })
  type: string;

  @Prop({
    type: String,
    enum: ['confirmed', 'rejected', 'waitingConfirmation', 'counted'],
    required: true,
  })
  status: string;

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: String,
    required: true,
    default: false,
  })
  entitlement: boolean;

  @Prop({
    type: mSchema.Types.ObjectId,
  })
  deputyId: string;

  @Prop({
    type: Date,
  })
  createdAt: Date;
}

export type PersonnelRequestDocument = PersonnelRequest & Document;

export const PersonnelRequestSchema =
  SchemaFactory.createForClass(PersonnelRequest);

PersonnelRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
});

PersonnelRequestSchema.virtual('deputy', {
  ref: 'User',
  localField: 'deputyId',
  foreignField: '_id',
  justOne: true,
});
