import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormBuilderForm } from './form.schema';
import { FormVersion } from './form-version.schema';
import { FormOccurrence } from './form-occurrence.schema';

export enum FormResponseStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
}

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
})
export class FormResponse extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormOccurrence.name,
    required: true,
    unique: true,
  })
  public occurrenceId: string;

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
    type: SchemaTypes.Types.Mixed,
    default: {},
  })
  public answers: Record<string, unknown>;

  @Prop({
    type: String,
    enum: Object.values(FormResponseStatus),
    default: FormResponseStatus.DRAFT,
  })
  public status: FormResponseStatus;

  // Optimistic-concurrency guard for autosave (spec 12: "پاسخ‌های جدیدتر
  // نباید با درخواست‌های قدیمی‌تر بازنویسی شوند"). Bumped on every save;
  // a save request carrying a stale revision is rejected, not overwritten.
  @Prop({
    type: Number,
    default: 0,
  })
  public revision: number;

  @Prop({
    type: Date,
    default: null,
  })
  public lastSavedAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  public submittedAt: Date;

  // Name captured at the moment of final submission (spec 13: "ثبت شناسه و
  // نام تکمیل‌کننده") - kept even if the person's profile name changes later.
  @Prop({
    type: String,
    default: null,
  })
  public completerName: string;

  // Signature is stored as a base64 snapshot taken at finalize time, not a
  // live reference to the personnel file - spec 14 explicitly requires that
  // a later change to the employee's on-file signature must not alter past
  // records.
  @Prop({
    type: String,
    default: null,
  })
  public signatureBase64: string;

  @Prop({
    type: Date,
    default: null,
  })
  public signedAt: Date;
}

export type FormResponseDocument = FormResponse & Document;
export const FormResponseSchema = SchemaFactory.createForClass(FormResponse);
