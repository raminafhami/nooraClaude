import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { PerformanceActivityType } from './activity-type.schema';

class ActivityChange {
  @Prop({ type: Date, required: true })
  at: Date;

  @Prop({ type: String, required: true })
  by: string;

  @Prop({ type: String, required: true })
  byName: string;

  @Prop({ type: SchemaTypes.Types.Mixed, required: true })
  changes: Record<string, { from: unknown; to: unknown }>;
}

@Schema({
  collection: 'manualactivities',
  versionKey: false,
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc, ret) {
      delete ret._id;
      return ret;
    },
  },
})
export class ManualActivity extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId, ref: User.name, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  dateKey: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: false, default: null })
  organizationalUnitId: string | null;

  @Prop({ type: String, required: true })
  organizationalUnitTitle: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: PerformanceActivityType.name,
    required: true,
  })
  activityTypeId: string;

  @Prop({ type: String, required: true })
  activityTypeTitle: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: UserGroup.name,
    required: true,
  })
  groupId: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: false, default: null })
  startTime: string | null;

  @Prop({ type: String, required: false, default: null })
  endTime: string | null;

  @Prop({ type: String, enum: ['completed', 'incomplete'], required: true })
  status: 'completed' | 'incomplete';

  @Prop({ type: String, required: false, default: null })
  incompleteReason: string | null;

  @Prop([ActivityChange])
  changeHistory: ActivityChange[];
}

export type ManualActivityDocument = ManualActivity & Document;
export const ManualActivitySchema = SchemaFactory.createForClass(ManualActivity);
ManualActivitySchema.index({ userId: 1, dateKey: 1 });
