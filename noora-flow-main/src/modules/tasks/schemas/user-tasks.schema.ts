import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { ProcessInstance } from 'src/modules/process-instances/schemas/process-instances.schema';

export type UserTasksDocument = UserTasks & Document;

class PropertyType {
  @Prop()
  type: string;

  @Prop()
  arrayOf: string;

  @Prop()
  default: string;

  @Prop()
  required: boolean;

  @Prop()
  enum: [any];

  @Prop()
  properties: [any];

  @Prop()
  displayType: string;
}

class Property {
  @Prop()
  key: string;

  @Prop()
  section: string;

  @Prop({ type: PropertyType })
  value: PropertyType;
}
class Candidate {
  @Prop({ type: [String] })
  groups: string[];

  @Prop({ type: [String] })
  users: string[];
}

class FormField {
  @Prop()
  key: string;

  @Prop()
  type: string;

  @Prop()
  value: string;

  @Prop()
  required: boolean;
}

class Form {
  @Prop()
  key: string;

  @Prop()
  name: string;

  @Prop({ type: [FormField] })
  fields: FormField[];
}

class Variable {
  @Prop()
  key: string;

  @Prop()
  type: string;

  @Prop()
  required: boolean;

  @Prop({ type: SchemaTypes.Types.Mixed })
  value: any;
}

class User {
  @Prop({ type: SchemaTypes.Types.ObjectId })
  userId: string;

  @Prop()
  emailId: string;
}
class Params extends Document {
  [key: string]: any;
}

class History {
  @Prop(Params)
  parameters: Params;

  @Prop()
  timeActivated: number;

  @Prop()
  timeStarted: number;

  @Prop()
  timeCompleted: number;
}

@Schema({
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
export class UserTasks extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId })
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop()
  processDefinitionName?: string;

  @Prop({
    required: true,
    type: SchemaTypes.Types.ObjectId,
    ref: ProcessInstance.name,
  })
  processInstanceId: string;

  @Prop()
  caseNo?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  rootProcessInstanceId: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  taskId: string;

  @Prop()
  key: string;

  @Prop({ required: true })
  summary: string;

  @Prop()
  description: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  assignee: string;

  @Prop({ type: Candidate })
  candidate: Candidate;

  @Prop({ type: [SchemaTypes.Types.ObjectId] })
  watchers: string[];

  @Prop([Property])
  properties: Property[];

  @Prop([Form])
  subForms: Form[];

  @Prop([Variable])
  data: Variable;

  @Prop({ default: -1 })
  expStartDate: number;

  @Prop({ default: -1 })
  expEndDate: number;

  @Prop({ default: null })
  dueDate: number;

  @Prop({ default: null })
  priority: string;

  // @Prop(Params)
  // parameters: Params;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ required: true, default: 'todo' })
  status: string;

  @Prop(User)
  createdBy: User;

  @Prop(User)
  completedBy: User;

  @Prop(User)
  updatedBy: User;

  @Prop([History])
  history: History[];

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
    default: null,
  })
  referredBy: string;

  @Prop({ type: Date, default: null })
  readAt: Date;
}

export const UserTasksSchema = SchemaFactory.createForClass(UserTasks);
UserTasksSchema.set('minimize', false);
UserTasksSchema.index(
  { processInstanceId: 1, taskId: 1, userId: 1 },
  { unique: true },
);
