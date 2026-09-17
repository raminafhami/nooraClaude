import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  SchemaType,
  Schema as SchemaTypes,
  Types,
} from 'mongoose';
import { PaymentStatuses } from 'src/common/const/enums';
import { User } from 'src/modules/users/schemas/user.schema';

export enum TRANSACTION_TYPES {
  PURCHASE = 'Purchase',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({
    type: String,
    required: true,
  })
  amount: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    enum: TRANSACTION_TYPES,
  })
  transActionType: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  terminalId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  acceptorId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  bankPaymentId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  requestId: string;

  @Prop({
    type: Number,
    required: true,
    trim: true,
  })
  requestTimestamp: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  revertUri: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  retrievalReferenceNumber?: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  systemTraceAuditNumber?: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isVerified: boolean;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: true,
  })
  invoiceId: string;

  @Prop({
    type: String,
    enum: PaymentStatuses,
    required: true,
  })
  status: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  createdBy?: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  updatedBy?: string;

  @Prop({
    type: String,
    required: true,
  })
  invoiceType: string;
}
export type PaymentDocument = Payment & Document;

export const PaymentSchema = SchemaFactory.createForClass(Payment);
