import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as SchemaTypes } from 'mongoose';
import {
  StageTypes,
  StageSubTypes,
  ConnectorTypes,
} from 'src/common/const/enums';
import { InspectionFile } from 'src/modules/files/schemas/inspection-files.schema';

export type ProcessInstanceDocument = ProcessInstance & Document;

class Dependency extends Document {
  @Prop()
  processDefinitionKey: string;

  @Prop()
  stageKey: string;
}

class Expression extends Document {
  @Prop()
  lhs: SchemaTypes.Types.Mixed;

  @Prop()
  op: string;

  @Prop()
  rhs: SchemaTypes.Types.Mixed;

  @Prop()
  _lhs: SchemaTypes.Types.Mixed;

  @Prop()
  _rhs: SchemaTypes.Types.Mixed;

  @Prop()
  _valid: boolean;
}

class Variable {
  @Prop()
  key: string;

  @Prop()
  type: string;

  @Prop()
  required: boolean;

  @Prop({ type: SchemaTypes.Types.Mixed })
  value?: any;
}

class Condition extends Document {
  @Prop()
  name: string;

  // @Prop()
  // op: string;

  @Prop()
  expression: string;

  @Prop()
  isValid: boolean;

  @Prop()
  onTrueNextStage: string;
}

class Params extends Document {
  [key: string]: any;
}

class stageIndexJSON extends Document {}
class PropertyType extends Document {
  @Prop()
  type: string;

  @Prop()
  arrayOf: string;

  @Prop()
  default: string;

  @Prop()
  label: string;

  @Prop()
  required: boolean;

  @Prop()
  enum: [any];

  @Prop()
  properties: [any];

  @Prop()
  displayType: string;
}

class Property extends Document {
  @Prop()
  key: string;

  @Prop()
  section: string;

  @Prop({ type: PropertyType })
  value: PropertyType;
}

class Criteria extends Document {
  @Prop()
  allCompleted: boolean;

  @Prop()
  anyCompleted: boolean;

  @Prop()
  allActivitiesCompleted: boolean;

  @Prop()
  anyActivitiesCompleted: boolean;

  @Prop()
  allSuccess: boolean;

  @Prop()
  anySuccess: boolean;

  @Prop({ type: Boolean, default: true })
  mandatoryCompleted: boolean;

  @Prop({ type: Boolean, default: true })
  onErrorComplete: boolean;

  @Prop({ type: Boolean, default: false })
  showError: boolean;
}

class Flags extends Document {
  @Prop()
  _error: boolean;

  @Prop()
  _allCompleted: boolean;

  @Prop()
  _anyCompleted: boolean;

  @Prop()
  _allActivitiesCompleted: boolean;

  @Prop()
  _anyActivitiesCompleted: boolean;

  @Prop()
  _allSuccess: boolean;

  @Prop()
  _anySuccess: boolean;

  @Prop()
  _mandatoryCompleted: boolean;
}

class Connector {
  @Prop({ type: String, enum: ConnectorTypes })
  type: ConnectorTypes;

  @Prop()
  config: SchemaTypes.Types.Mixed;
}

class ServiceType {
  @Prop({ type: String })
  name: string;

  @Prop()
  inputs: SchemaTypes.Types.Mixed;

  @Prop()
  output: string;
}

class File {
  @Prop()
  extensions: string;

  @Prop()
  multiple?: boolean;

  @Prop()
  directory?: string;

  @Prop()
  access?: SchemaTypes.Types.Mixed;

  @Prop()
  isGenerated: boolean;
}

class DocumentType {
  [key: string]: {
    name: string;
    title: string;
    extensions: string[];
    multiple: boolean;
  };
}

class DocumentFolder {
  [key: string]: { types: string[] };
}
class Documents {
  types: DocumentType;
  folders: DocumentFolder;
}

class State {
  name: string;
  title: string;
}

class History {
  @Prop()
  status: string;

  @Prop(Params)
  parameters: Params;

  @Prop()
  timeActivated: number;

  @Prop()
  timeStarted: number;

  @Prop()
  timeCompleted: number;

  @Prop()
  _flags: Flags;

  @Prop()
  _error: SchemaTypes.Types.Mixed;

  @Prop()
  _data: SchemaTypes.Types.Mixed;
}
class Candidate {
  @Prop({ type: [String] })
  groups: string[];

  @Prop({ type: [String] })
  users: string[];
}
@Schema({
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
class StageInstanceSchema {
  _id: Types.ObjectId;

  @Prop()
  key: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  stageId: string;

  @Prop()
  name: string;

  @Prop()
  displayName: string;

  @Prop()
  description: string;

  @Prop({ default: 'waiting' })
  status: string;

  @Prop({ type: String, enum: StageTypes, default: 'activity' })
  type: StageTypes; //start, end, gateway, system task, timer

  @Prop({ type: String, enum: StageSubTypes, default: 'system-task' })
  subType: StageSubTypes; //start, end, gateway, system task, timer

  @Prop({ default: true })
  auto: boolean; // execute stage automatically or trigger manually

  // @Prop({ default: false })
  // disabled: boolean; // disable stage

  @Prop({ default: true })
  mandatory: boolean; // disable stage

  @Prop({ type: [String] })
  nextStages: string[];

  @Prop()
  defaultNextStage: string;

  @Prop([Property])
  properties: Property[];

  @Prop({ type: Candidate })
  candidate: Candidate;

  @Prop([String])
  subForms: string[];

  @Prop([String])
  data: string[];

  @Prop([Condition])
  conditions?: Condition[];

  @Prop([Condition])
  conditionsExp?: Condition[];

  @Prop([String])
  parallelStages: string[];

  @Prop(Params)
  parameters?: Params;

  @Prop({ type: String })
  assignee: string;

  @Prop({ type: String, default: null })
  dueDate: string;

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop({ type: Connector, default: null })
  connector?: Connector;

  @Prop({ type: ServiceType, default: null })
  service?: ServiceType;

  @Prop({ required: true, default: Date.now() })
  timeActivated: number;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ default: 0 })
  estimatedTimeDuration?: number; // milliseconds

  @Prop({ default: 0 })
  expToCompleteAt?: number; // milliseconds, for timer event to complete

  @Prop()
  priority?: string;

  @Prop({ type: Flags, default: {} })
  _flags: Flags;

  @Prop()
  _error: SchemaTypes.Types.Mixed;

  @Prop()
  _data: SchemaTypes.Types.Mixed;

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop()
  processInstanceId?: string;

  @Prop([History])
  history: History[];
}

class User {
  @Prop({ type: SchemaTypes.Types.ObjectId })
  userId: string;

  @Prop()
  emailId: string;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc: any, ret: any) {
      delete ret._startIndex;
      delete ret._endIndex;
      delete ret._flags;
      delete ret._stageIndexJSON;
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
export class ProcessInstance extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId })
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop()
  processDefinitionName?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  parentProcessInstanceId?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  rootProcessInstanceId?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  feasibilityProcessInstanceId?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId })
  parentTaskId?: string;

  @Prop({ index: true })
  name: string;

  @Prop({ index: true })
  caseNo: string;

  @Prop({ type: String, default: null, required: false })
  contractNo?: string;

  @Prop({ default: false })
  isParallel: boolean;

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  reason?: string;

  @Prop({ required: true, default: 0 })
  version: number;

  @Prop([Property])
  properties: Property[];

  @Prop(Params)
  parameters: Params;

  @Prop({ type: String })
  owner: string;

  @Prop([StageInstanceSchema])
  stages: StageInstanceSchema[];

  @Prop([Variable])
  processVariables: Variable[];

  @Prop({ type: Documents })
  documents: Documents;

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ type: String, default: '' })
  currentState: string;

  @Prop([State])
  stateList: State[];

  @Prop({ type: Candidate })
  candidateStarter: Candidate;

  @Prop({ required: true, default: Date.now() })
  timeActivated: number;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ required: true, default: -1 })
  timeOnhold: number;

  @Prop({ required: true, default: -1 })
  timeCancelled: number;

  @Prop({ required: true, default: -1 })
  timeResumed: number;

  @Prop({ required: true, default: 'active' })
  status: string;

  @Prop(stageIndexJSON)
  _stageIndexJSON: stageIndexJSON;

  @Prop({ type: Flags, default: {} })
  _flags: Flags;

  @Prop({ default: 0 })
  _startIndex: number;

  @Prop({ default: -1 })
  _endIndex: number;

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop({ type: SchemaTypes.Types.ObjectId, required: false, ref: User.name })
  createdBy?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: false, ref: User.name })
  holdBy?: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: false, ref: User.name })
  cancelledBy: string;

  @Prop({ type: SchemaTypes.Types.ObjectId, required: false, ref: User.name })
  resumedBy: string;

  @Prop({ type: Number, default: null })
  maxPossibleDuration: number;
}

export const ProcessInstanceSchema =
  SchemaFactory.createForClass(ProcessInstance);

ProcessInstanceSchema.virtual('inspectionFiles', {
  ref: InspectionFile.name,
  localField: 'parameters.InspectionInstanceId',
  foreignField: 'processInstanceId',
  options: {
    projection: 'id',
  },
});

ProcessInstanceSchema.virtual('inspectionCosts', {
  ref: 'InspectionCost',
  localField: '_id',
  foreignField: 'caseId',
});

ProcessInstanceSchema.virtual('debts', {
  ref: 'Debt',
  localField: '_id',
  foreignField: 'instanceId',
});

ProcessInstanceSchema.virtual('invoiceItems', {
  ref: 'Invoice',
  localField: 'parameters.InvoiceItems.id',
  foreignField: '_id',
  options: {
    projection: 'issueNo',
  },
});

ProcessInstanceSchema.virtual('creator', {
  ref: User.name,
  localField: 'owner',
  foreignField: '_id',
  as: 'creator',
  justOne: true,
});
