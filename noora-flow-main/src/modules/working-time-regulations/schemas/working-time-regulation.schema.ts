import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  ObjectId,
  Schema as mSchema,
} from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({
  versionKey: false,
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
})
export class WorkingTimeRegulation extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value: string) {
        // Use the regex to validate the time format
        return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid time format (hh:mm:ss)`,
    },
  })
  public entryTime: Date;

  @Prop({
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value: string) {
        // Use the regex to validate the time format
        return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid time format (hh:mm:ss)`,
    },
  })
  public exitTime: Date;

  @Prop({
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value: string) {
        // Use the regex to validate the time format
        return /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);
      },
      message: (props) =>
        `${props.value} is not a valid time format (hh:mm:ss)`,
    },
  })
  public flexible: Date;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public title: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public legalExtra: string;

  @Prop({
    type: Boolean,
    trim: true,
    default: true,
    required: true
  })
  isActive: boolean

  @Prop({
    type: [{ type: mSchema.Types.ObjectId, ref: User.name }],
    default: [],
  })
  public users: any[];
}

export type WorkingTimeRegulationDocument = WorkingTimeRegulation & Document;

export const WorkingTimeRegulationSchema = SchemaFactory.createForClass(
  WorkingTimeRegulation,
);
