import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';

@Schema({
  collection: 'performanceactivitytypes',
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
export class PerformanceActivityType extends Document {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: UserGroup.name,
    required: true,
  })
  groupId: string;

  @Prop({ type: String, required: false, default: '' })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export type PerformanceActivityTypeDocument = PerformanceActivityType & Document;
export const PerformanceActivityTypeSchema = SchemaFactory.createForClass(
  PerformanceActivityType,
);
