import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

class ReportChange {
  @Prop({ type: Date, required: true })
  at: Date;

  @Prop({ type: String, required: true })
  by: string;

  @Prop({ type: String, required: true })
  byName: string;

  @Prop({ type: String, required: true })
  summary: string;
}

@Schema({
  collection: 'dailyactivityreports',
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
export class DailyActivityReport extends Document {
  @Prop({ type: SchemaTypes.Types.ObjectId, ref: User.name, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  dateKey: string;

  @Prop({ type: String, enum: ['sent'], default: 'sent' })
  status: 'sent';

  @Prop({ type: Date, required: true })
  sentAt: Date;

  @Prop({ type: String, enum: ['manual', 'auto'], required: true })
  sentBy: 'manual' | 'auto';

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: false, default: null })
  organizationalUnitId: string | null;

  @Prop({ type: String, required: true })
  organizationalUnitTitle: string;

  @Prop({ type: Boolean, default: false })
  notificationSent: boolean;

  @Prop([ReportChange])
  changeHistory: ReportChange[];
}

export type DailyActivityReportDocument = DailyActivityReport & Document;
export const DailyActivityReportSchema =
  SchemaFactory.createForClass(DailyActivityReport);
DailyActivityReportSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
