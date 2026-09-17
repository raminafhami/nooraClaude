import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mSchema } from 'mongoose';
import { InvoiceStatuses, InvoiceTypes } from 'src/common/const/enums';
import {
  Income,
  IncomeDocument,
} from 'src/modules/income/schemas/income.schema';
import { User } from 'src/modules/users/schemas/user.schema';
import { IRecipient } from '../interfaces/recipient.interface';
import { IInvoiceItem } from '../interfaces/invoice-item.interface';

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ type: String, required: false, trim: true })
  title?: string;

  @Prop({ type: String, required: false, trim: true })
  description?: string;

  @Prop({
    type: String,
    enum: InvoiceStatuses,
    required: true,
    default: InvoiceStatuses.Active,
  })
  status: string;

  @Prop({ type: String, enum: InvoiceTypes, required: true })
  type: string;

  @Prop({ type: Date, required: false })
  expiryAt?: Date;

  @Prop({ type: Date, required: false })
  issuedAt?: Date;

  @Prop({
    type: [
      {
        type: mSchema.Types.ObjectId,
        ref: Income.name,
        required: false,
        default: [],
      },
    ],
  })
  items: mSchema.Types.ObjectId[];

  @Prop({ type: Object })
  recipient: IRecipient;

  @Prop({ type: String, required: true })
  invoiceNo: string;

  @Prop({ type: String, required: false })
  issueNo?: string;

  @Prop({ type: Number, required: true, default: 0 })
  discount: number;

  @Prop({ type: Number, required: false, default: 0 })
  duty: number;

  @Prop({ type: Number, required: true, default: 0 })
  additionalFee: number;

  @Prop({ type: Boolean, required: true, default: true })
  isCash: boolean;

  @Prop({ type: String, required: false, trim: true })
  financialDocumentId?: string;

  @Prop({ type: Number, required: false })
  total?: number;

  @Prop({ type: Number, required: false })
  tax?: number;

  @Prop({ type: mSchema.Types.ObjectId, ref: User.name, required: true })
  createdBy: mSchema.Types.ObjectId;

  @Prop({ type: mSchema.Types.ObjectId, ref: User.name, required: false })
  issuedBy?: mSchema.Types.ObjectId;

  @Prop({ type: mSchema.Types.ObjectId, ref: User.name, required: false })
  updatedBy?: mSchema.Types.ObjectId;

  @Prop({ type: Number, required: false })
  lock?: number;
}

export type InvoiceDocument = Invoice & Document;

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
