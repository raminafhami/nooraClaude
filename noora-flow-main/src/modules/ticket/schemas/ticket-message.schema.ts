import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Ticket } from './ticket.schema';
import { TicketMessageFile } from './ticket-message-file.schema';

export enum TicketMessageType {
  TEXT = 'text',
  FILE = 'ّfile',
}

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      delete ret.fileId;
      if (ret.type != 'FILE') {
        delete ret.file;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      delete ret.fileId;
      if (ret.type != 'FILE') {
        delete ret.file;
      }
      return ret;
    },
  },
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class TicketMessage extends Document {
  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  })
  ticketId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: TicketMessageFile.name,
    required: false,
    default: null,
  })
  fileId: string;

  @Prop({
    type: String,
    required: true,
  })
  type: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;

  @Prop({ type: Date, default: null })
  readedAt: Date;
}
export type TicketMessageDocument = TicketMessage & Document;

const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

TicketMessageSchema.virtual('file', {
  ref: TicketMessageFile.name,
  localField: 'fileId',
  foreignField: '_id',
  options: {
    projection: '_id filename mimetype',
  },
  justOne: true,
});

export { TicketMessageSchema };
