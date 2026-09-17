import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { Ticket } from './ticket.schema';

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
export class TicketMessageFile extends Document {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  })
  ticketId: string;

  @Prop({ type: String, required: true })
  directory: string;

  @Prop({ type: String, required: true })
  filename: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  mimetype: string;
}
export type TicketMessageFileDocument = TicketMessageFile & Document;

export const TicketMessageFileSchema =
  SchemaFactory.createForClass(TicketMessageFile);
