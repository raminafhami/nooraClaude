import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormBuilderForm } from './form.schema';

// All 14 answer types required by spec section 7. Kept as a flat enum (no
// branching logic beyond validation) so new types can be added later without
// touching the storage shape.
export enum FormQuestionType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  PERCENT = 'percent',
  SINGLE_CHOICE = 'single_choice',
  MULTI_CHOICE = 'multi_choice',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  AMOUNT = 'amount',
  RATING = 'rating',
  FILE = 'file',
  STATIC_TEXT = 'static_text',
}

// Question types that never collect an answer from the employee (pure
// in-form guidance text) - used by validators to skip "required" checks.
export const NON_ANSWERABLE_QUESTION_TYPES = [FormQuestionType.STATIC_TEXT];

// Question types that need a manager-defined option list.
export const CHOICE_QUESTION_TYPES = [
  FormQuestionType.SINGLE_CHOICE,
  FormQuestionType.MULTI_CHOICE,
];

export enum FormVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// Explicit toJSON/toObject here (rather than relying on inherited parent
// serialization options) so `id` reliably appears on every option/question
// returned to the frontend - these are array subdocuments and Mongoose does
// not guarantee cascading virtuals/transform behavior from the root doc.
@Schema({
  _id: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class FormQuestionOption {
  @Prop({ type: String, required: true, trim: true })
  public title: string;

  @Prop({ type: Number, required: true })
  public order: number;
}
export const FormQuestionOptionSchema =
  SchemaFactory.createForClass(FormQuestionOption);

// Type-specific configuration. Kept as a loose embedded subdocument (rather
// than one schema per question type) because only a handful of primitive
// fields apply per type and Mongo has no polymorphic-subdocument union -
// see FormQuestionType for which fields are meaningful for which type.
@Schema({ _id: false, versionKey: false })
export class FormQuestionSettings {
  @Prop({ type: Number, default: null })
  public maxLength: number; // short_text / long_text

  @Prop({ type: Number, default: null })
  public minValue: number; // number / percent / amount

  @Prop({ type: Number, default: null })
  public maxValue: number; // number / percent / amount

  @Prop({ type: Number, default: null })
  public decimals: number; // number / amount

  @Prop({ type: String, default: null })
  public currency: string; // amount

  @Prop({ type: Number, default: null })
  public scaleMin: number; // rating

  @Prop({ type: Number, default: null })
  public scaleMax: number; // rating

  @Prop({ type: [FormQuestionOptionSchema], default: [] })
  public options: FormQuestionOption[]; // single_choice / multi_choice

  @Prop({ type: Number, default: null })
  public maxFiles: number; // file

  @Prop({ type: Number, default: null })
  public maxFileSizeMb: number; // file

  @Prop({ type: [String], default: [] })
  public allowedFileTypes: string[]; // file
}
export const FormQuestionSettingsSchema =
  SchemaFactory.createForClass(FormQuestionSettings);

@Schema({
  _id: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class FormQuestion {
  @Prop({ type: String, required: true, trim: true })
  public title: string;

  @Prop({ type: String, default: null })
  public description: string;

  @Prop({
    type: String,
    enum: Object.values(FormQuestionType),
    required: true,
  })
  public type: FormQuestionType;

  @Prop({ type: Boolean, default: false })
  public required: boolean;

  @Prop({ type: Number, required: true })
  public order: number;

  @Prop({ type: FormQuestionSettingsSchema, default: () => ({}) })
  public settings: FormQuestionSettings;
}
export const FormQuestionSchema = SchemaFactory.createForClass(FormQuestion);

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
export class FormVersion extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormBuilderForm.name,
    required: true,
  })
  public formId: string;

  @Prop({
    type: Number,
    required: true,
  })
  public versionNo: number;

  @Prop({
    type: String,
    enum: Object.values(FormVersionStatus),
    default: FormVersionStatus.DRAFT,
  })
  public status: FormVersionStatus;

  @Prop({
    type: [FormQuestionSchema],
    default: [],
  })
  public questions: FormQuestion[];

  @Prop({
    type: Date,
    default: null,
  })
  public publishedAt: Date;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public createdBy: string;
}

export type FormVersionDocument = FormVersion & Document;
export const FormVersionSchema = SchemaFactory.createForClass(FormVersion);
FormVersionSchema.index({ formId: 1, versionNo: 1 }, { unique: true });
