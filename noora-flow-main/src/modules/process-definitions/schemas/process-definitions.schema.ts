import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types, Schema as SchemaTypes } from 'mongoose';
import {
  StageTypes,
  StageSubTypes,
  ConnectorTypes,
} from 'src/common/const/enums';

export type ProcessDefinitionDocument = ProcessDefinition & Document;

class CompiledDefinition {}

class Expression {
  @Prop()
  lhs: SchemaTypes.Types.Mixed;

  @Prop()
  op: string;

  @Prop()
  rhs: SchemaTypes.Types.Mixed;
}

class Condition {
  @Prop()
  name: string;

  @Prop()
  op: string;

  @Prop({ type: [Expression] })
  expressions: Expression[];

  @Prop()
  onTrueNextStage: string;

  @Prop()
  onFalseNextStage: string;
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

class ConditionExp {
  @Prop()
  name: string;

  @Prop()
  expression: string;

  @Prop()
  onTrueNextStage: string;
}

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

class Criteria {
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
  onErrorComplete: boolean; // Stage level criteria

  @Prop({ type: Boolean, default: false })
  showError: boolean; // stage level criteria
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
class StageDefinitionSchema {
  @Prop()
  key: string;

  @Prop()
  name: string;

  @Prop()
  displayName: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: StageTypes, default: 'activity' })
  type: StageTypes; //start, end, gateway, system task, timer

  @Prop({ type: String, enum: StageSubTypes, default: 'system-task' })
  subType: StageSubTypes; //start, end, gateway, system task, timer

  @Prop({ default: true })
  auto: boolean; // execute stage automatically or trigger manually

  @Prop({ default: false })
  disabled: boolean; // disable stage

  @Prop({ default: true })
  mandatory: boolean; // disable stage

  @Prop({ type: [String] })
  nextStages: string[];

  @Prop()
  defaultNextStage: string;

  @Prop([Property])
  properties: Property[];

  @Prop([String])
  subForms: string[];

  @Prop([String])
  data: string[];

  @Prop({ type: Candidate })
  candidate: Candidate;

  @Prop([Condition])
  conditions: Condition[];

  @Prop([ConditionExp])
  conditionsExp: ConditionExp[];

  @Prop([String])
  parallelStages: string[];

  @Prop({ type: String })
  assignee: string;

  @Prop({ type: String, default: null })
  dueDate: string;

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop({ type: Connector, default: null })
  connector?: Connector;

  @Prop({ type: ServiceType, default: null })
  service?: ServiceType;

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop({ default: 0 })
  estimatedTimeDuration?: number; // milliseconds

  @Prop()
  priority?: string;
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
export class ProcessDefinition extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ index: true })
  key: string;

  @Prop({ default: false })
  isParallel: boolean;

  @Prop({ default: true })
  displayable: boolean;

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop()
  description: string;

  @Prop({ type: String, required: false, default: null })
  indicator: string;

  @Prop({ type: Boolean, required: false, default: false })
  useCN: boolean;

  @Prop({ required: true })
  version: number;

  @Prop([Property])
  properties: Property[];

  @Prop([StageDefinitionSchema])
  stages: StageDefinitionSchema[];

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop({ type: Candidate })
  candidateStarter: Candidate;

  @Prop({ type: Documents, default: {} })
  documents: Documents;

  @Prop([State])
  stateList: State[];

  @Prop([Variable])
  processVariables: Variable[];

  @Prop({ type: String, default: null })
  maxPossibleDuration: string;

  @Prop({ type: CompiledDefinition })
  _compiledDefinition?: CompiledDefinition;
}

export const ProcessDefinitionSchema =
  SchemaFactory.createForClass(ProcessDefinition);
ProcessDefinitionSchema.index({ key: 1, version: 1 }, { unique: true });
