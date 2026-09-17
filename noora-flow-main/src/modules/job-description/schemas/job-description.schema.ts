import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { Expertise } from 'src/modules/expertise/schemas/expertise.schema';
@Schema({
  _id: false,
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
class Requirement {
  @Prop({ type: [{ level: String, name: String, field: String }], _id: false })
  degree: {
    level?: string;
    name?: string;
    field?: string;
  }[];

  @Prop({ type: { related: String, unrelated: String }, _id: false })
  experience: {
    related?: string;
    unrelated?: string;
  };

  @Prop({
    type: [
      { type: SchemaTypes.Types.ObjectId, ref: Expertise.name, _id: false },
    ],
    required: true,
  })
  expertises: string[];

  @Prop({ type: String })
  description: string;
}

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      if (ret.ex) {
        ret.requirements.expertises = ret.ex;
        delete ret.ex;
      }
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      if (ret.ex) {
        ret.requirements.expertises = ret.ex;
        delete ret.ex;
      }
      delete ret._id;
      return ret;
    },
  },
})
export class JobDescription extends Document {
  @Prop({
    type: String,
    required: true,
  })
  code: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  department: string;

  @Prop({
    type: String,
    required: true,
  })
  supervisor: string;

  @Prop({
    type: String,
    required: true,
  })
  definition: string;

  @Prop({
    type: [String],
    required: true,
  })
  duties: string[];

  @Prop({
    type: [String],
    required: true,
  })
  authorities: string[];

  @Prop({ type: Requirement })
  requirements: {
    degree: {
      level?: string;
      name?: string;
      field?: string;
    }[];
    experience: {
      related?: number;
      unrelated?: number;
    };
    expertises: string[];
    description: string;
  };

  @Prop({ type: SchemaTypes.Types.Mixed })
  metadata: object;
}
export type JobDescriptionDocument = JobDescription & Document;

const JobDescriptionSchema = SchemaFactory.createForClass(JobDescription);
JobDescriptionSchema.virtual('ex', {
  ref: Expertise.name,
  localField: 'requirements.expertises',
  foreignField: '_id',
  // options: { projection: 'email' }, // sample
});
export { JobDescriptionSchema };
