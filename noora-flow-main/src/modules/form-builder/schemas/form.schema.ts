import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FormCategory } from './form-category.schema';

// Form-level status reflects what the card/list should show. It is derived
// from version lifecycle: a form starts as DRAFT (only a draft version
// exists), becomes PUBLISHED the first time a version is published, and can
// be ARCHIVED at any point afterwards to stop new occurrences while keeping
// past records intact (see FormVersionStatus for per-version state).
export enum FormStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) delete ret.categoryId;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    minimize: false,
    transform(doc: any, ret: any) {
      delete ret._id;
      if (ret?.category) delete ret.categoryId;
      return ret;
    },
  },
})
// Named FormBuilderForm (not Form) so its Mongoose model/collection never
// collides with the legacy `Form` model of the old form module.
export class FormBuilderForm extends Document {
  // Fixed prefix (APK-FR-001, APK-FR-002, ...),
  // generated server-side via the shared IndicatorService and never reused.
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public code: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public title: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: FormCategory.name,
    required: true,
  })
  public categoryId: string;

  @Prop({
    type: String,
    default: null,
  })
  public description: string;

  @Prop({
    type: String,
    enum: Object.values(FormStatus),
    default: FormStatus.DRAFT,
  })
  public status: FormStatus;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'FormVersion',
    default: null,
  })
  public publishedVersionId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'FormVersion',
    default: null,
  })
  public draftVersionId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  public createdBy: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  public archivedBy: string;

  @Prop({
    type: Date,
    default: null,
  })
  public archivedAt: Date;
}

export type FormDocument = FormBuilderForm & Document;
export const FormSchema = SchemaFactory.createForClass(FormBuilderForm);

FormSchema.virtual('category', {
  ref: FormCategory.name,
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Lightweight by default (no `questions`) since these populate on list
// views too - full question content is fetched directly from FormVersion
// by id wherever the builder/preview UI actually needs it.
FormSchema.virtual('publishedVersion', {
  ref: 'FormVersion',
  localField: 'publishedVersionId',
  foreignField: '_id',
  options: {
    projection: '_id versionNo status publishedAt',
  },
  justOne: true,
});

FormSchema.virtual('draftVersion', {
  ref: 'FormVersion',
  localField: 'draftVersionId',
  foreignField: '_id',
  options: {
    projection: '_id versionNo status',
  },
  justOne: true,
});

FormSchema.virtual('creator', {
  ref: User.name,
  localField: 'createdBy',
  foreignField: '_id',
  options: {
    projection: '_id name lastname username',
  },
  justOne: true,
});
