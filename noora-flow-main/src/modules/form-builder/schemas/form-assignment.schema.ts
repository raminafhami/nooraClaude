import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormBuilderForm } from './form.schema';

// Matches spec section 16. CUSTOM_RANGE is intentionally omitted - it was
// listed as optional ("در صورت سازگاری با معماری") and the fixed set below
// already covers every concrete requirement; adding a free-form range would
// need its own validation story with no current caller.
export enum FormAssignmentFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  NO_SCHEDULE = 'no_schedule',
}

export const RECURRING_FREQUENCIES = [
  FormAssignmentFrequency.DAILY,
  FormAssignmentFrequency.WEEKLY,
  FormAssignmentFrequency.MONTHLY,
  FormAssignmentFrequency.QUARTERLY,
  FormAssignmentFrequency.SEMI_ANNUAL,
  FormAssignmentFrequency.ANNUAL,
];

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
export class FormAssignment extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormBuilderForm.name,
    required: true,
  })
  public formId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public userId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public assignedBy: string;

  @Prop({
    type: String,
    enum: Object.values(FormAssignmentFrequency),
    required: true,
  })
  public frequency: FormAssignmentFrequency;

  @Prop({
    type: Date,
    required: true,
  })
  public startDate: Date;

  // Only meaningful for ONCE (the single occurrence's due date). Recurring
  // frequencies compute their due date per-period instead (see period.util).
  @Prop({
    type: Date,
    default: null,
  })
  public dueDate: Date;

  @Prop({
    type: Date,
    default: null,
  })
  public endDate: Date;

  @Prop({
    type: Boolean,
    default: true,
  })
  public notifyEnabled: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  public isActive: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  public deactivatedBy: string;

  @Prop({
    type: Date,
    default: null,
  })
  public deactivatedAt: Date;
}

export type FormAssignmentDocument = FormAssignment & Document;
export const FormAssignmentSchema =
  SchemaFactory.createForClass(FormAssignment);

// At most one active assignment per (form, person): the service pre-checks
// this, the index makes it hold under concurrent requests too.
FormAssignmentSchema.index(
  { formId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

FormAssignmentSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username',
  },
  justOne: true,
});
