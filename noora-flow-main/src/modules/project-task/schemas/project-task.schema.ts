import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Schema as SchemaTypes,
  Types,
} from 'mongoose';
import { ReminderMethod } from 'src/common/const/enums';
import { ProjectTaskLabel } from 'src/modules/project-task-label/schemas/project-task-label.schema';
import {
  Project,
  ProjectTaskStatus,
} from 'src/modules/project/schemas/project.schema';
import { Buyer } from 'src/modules/users/schemas/buyer.schema';
import { User } from 'src/modules/users/schemas/user.schema';

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
export class ProjectTask extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public title: string;

  @Prop({
    type: String,
    required: false,
  })
  type: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
    default: null,
  })
  public description: string;

  @Prop({
    type: String,
    required: true,
  })
  public status: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  public assignee: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Project.name,
    required: true,
  })
  public project: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: ProjectTaskLabel.name }],
    default: [],
    required: false,
  })
  public labels?: string[];

  @Prop({
    type: Date,
    required: false,
  })
  public deadline?: string;

  @Prop({
    type: Number,
    required: false,
  })
  public priority: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    max: 100,
  })
  public progress: number;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: Buyer.name,
    required: false,
  })
  public buyerId: string;

  @Prop({
    type: Date,
    required: false,
  })
  public reminder: Date;

  @Prop({
    type: String,
    required: false,
    enum: ReminderMethod,
  })
  public reminderMethod: string;

  @Prop({
    type: String,
    required: true,
  })
  public taskNo: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  public customerId: string;

  @Prop({ type: Number })
  public order: number;

  @Prop({ type: Boolean, required: false, default: false })
  isConfidential: boolean;

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  public files: string[];

  @Prop({
    type: Date,
    default: () => new Date(),
    required: true,
  })
  createdAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: string;
}
export type ProjectTaskDocument = ProjectTask & Document;

const ProjectTaskSchema = SchemaFactory.createForClass(ProjectTask);

export { ProjectTaskSchema };
