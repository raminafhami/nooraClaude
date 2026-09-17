import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as SchemaTypes } from 'mongoose';
import { UserGroup } from 'src/modules/user-groups/schemas/user-group.schema';
import { User } from 'src/modules/users/schemas/user.schema';
import { TicketMessage } from './ticket-message.schema';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  ON_HOLD = 'on-hold',
  CLOSED = 'closed',
}

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
  timestamps: {
    createdAt: true,
    updatedAt: 'modifiedAt',
  },
})
export class Ticket extends Document {
  @Prop({
    type: String,
    required: true,
  })
  subject: string;

  @Prop({
    type: String,
    required: true,
  })
  ticketNo: string;

  @Prop({
    type: String,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
    required: true,
  })
  status: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  assignee: string;

  @Prop({
    type: String,
    // ref: UserGroup.name,
    required: false,
  })
  group: string;

  @Prop({
    type: Number,
    default: 0,
    required: true,
  })
  priority: number;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  reference?: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  referenceType?: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  modifiedBy: string;

  @Prop({
    type: Date,
    default: null,
  })
  deadlinedAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  remindedAt: Date;
}
export type TicketDocument = Ticket & Document;

const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.virtual('lastMessage', {
  ref: TicketMessage.name,
  localField: '_id',
  foreignField: 'ticketId',
  options: {
    projection: '_id type content',
    sort: {
      createdAt: -1,
    },
  },
  justOne: true,
});

TicketSchema.virtual('messages', {
  ref: TicketMessage.name,
  localField: '_id',
  foreignField: 'ticketId',
  options: {
    sort: {
      createdAt: -1,
    },
    populate: [
      { path: 'file' },
      { path: 'createdBy', select: '_id name lastname' },
    ],
    limit: 20,
  },
});

export { TicketSchema };
