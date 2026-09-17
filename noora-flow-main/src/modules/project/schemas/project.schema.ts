import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Schema as SchemaTypes,
  Types,
} from 'mongoose';
import { ProjectType } from 'src/common/const/enums';
import { ProjectTaskLabel } from 'src/modules/project-task-label/schemas/project-task-label.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema()
export class ProjectTaskStatus {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public name: string;

  @Prop({
    type: Number,
    required: true,
    trim: true,
    default: 0,
  })
  public order: number;
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
export class Project extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public name: string;

  @Prop([ProjectTaskStatus])
  statuses: ProjectTaskStatus[];

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: User.name }],
    default: [],
  })
  public members: string[];

  @Prop({
    type: String,
    required: false,
    enum: ProjectType,
  })
  public type: string;

  @Prop({
    type: [{ type: SchemaTypes.Types.ObjectId, ref: ProjectTaskLabel.name }],
    default: [],
    required: false,
  })
  public labels?: string[];

  @Prop({
    type: Date,
    default: () => new Date(),
    required: true,
  })
  createdDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;
}
export type ProjectDocument = Project & Document;

const ProjectSchema = SchemaFactory.createForClass(Project);


export { ProjectSchema };

