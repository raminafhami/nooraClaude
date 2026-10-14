import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormBuilderForm } from './form.schema';
import { FormVersion } from './form-version.schema';
import {
  FormAssignment,
  FormAssignmentFrequency,
} from './form-assignment.schema';

export enum FormOccurrenceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

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
export class FormOccurrence extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormAssignment.name,
    required: true,
  })
  public assignmentId: string;

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
    ref: FormVersion.name,
    required: true,
  })
  public versionId: string;

  @Prop({
    type: String,
    enum: Object.values(FormAssignmentFrequency),
    required: true,
  })
  public frequency: FormAssignmentFrequency;

  // Null only for NO_SCHEDULE occurrences, which are intentionally excluded
  // from the uniqueness index (see FormOccurrenceSchema.index below) so an
  // employee can open as many independent occurrences as they need. ONCE
  // uses the fixed literal 'once' so the same index still caps it at one.
  @Prop({
    type: String,
    default: null,
  })
  public periodKey: string;

  @Prop({
    type: Date,
    default: null,
  })
  public periodStart: Date;

  @Prop({
    type: Date,
    default: null,
  })
  public periodEnd: Date;

  @Prop({
    type: Date,
    default: null,
  })
  public dueDate: Date;

  @Prop({
    type: String,
    enum: Object.values(FormOccurrenceStatus),
    default: FormOccurrenceStatus.PENDING,
  })
  public status: FormOccurrenceStatus;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'FormResponse',
    default: null,
  })
  public responseId: string;

  // NO_SCHEDULE only: 'open' while the occurrence is not finalized, removed
  // on finalize. The partial unique index below allows at most one open
  // occurrence per assignment even under concurrent "تکمیل فرم جدید" clicks.
  @Prop({
    type: String,
    default: undefined,
  })
  public openSlot?: string;
}

export type FormOccurrenceDocument = FormOccurrence & Document;
export const FormOccurrenceSchema =
  SchemaFactory.createForClass(FormOccurrence);

FormOccurrenceSchema.index(
  { assignmentId: 1, periodKey: 1 },
  { unique: true, partialFilterExpression: { periodKey: { $type: 'string' } } },
);

FormOccurrenceSchema.index(
  { assignmentId: 1, openSlot: 1 },
  { unique: true, partialFilterExpression: { openSlot: { $type: 'string' } } },
);
