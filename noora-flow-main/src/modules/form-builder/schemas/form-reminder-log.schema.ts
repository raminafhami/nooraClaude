import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { FormOccurrence } from './form-occurrence.schema';

export enum FormReminderType {
  BEFORE_DUE = 'before_due',
  DUE = 'due',
  OVERDUE = 'overdue',
}

// One row per (occurrence, reminderType) ever sent - the unique index below
// is what makes "no duplicate reminder" (spec 17.4) a DB-level guarantee
// rather than a best-effort in-memory check, safe under concurrent/retried
// cron runs.
@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
})
export class FormReminderLog extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormOccurrence.name,
    required: true,
  })
  public occurrenceId: string;

  @Prop({
    type: String,
    enum: Object.values(FormReminderType),
    required: true,
  })
  public reminderType: FormReminderType;

  @Prop({ type: Date, default: () => new Date() })
  public sentAt: Date;
}

export type FormReminderLogDocument = FormReminderLog & Document;
export const FormReminderLogSchema =
  SchemaFactory.createForClass(FormReminderLog);
FormReminderLogSchema.index(
  { occurrenceId: 1, reminderType: 1 },
  { unique: true },
);
