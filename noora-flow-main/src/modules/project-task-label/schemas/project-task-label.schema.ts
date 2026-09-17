import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';

export enum Priorities {
  HIGHEST = 'highest',
  MEDIUM = 'medium',
  LOW = 'low',
  LOWEST = 'lowest',
}

@Schema({
  versionKey: false,
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
export class ProjectTaskLabel extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public title: string;
}
export type ProjectTaskLabelDocument = ProjectTaskLabel & Document;

const ProjectTaskLabelSchema = SchemaFactory.createForClass(ProjectTaskLabel);

export { ProjectTaskLabelSchema };
