import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  TicketMessage,
  TicketMessageDocument,
} from '../schemas/ticket-message.schema';

@Injectable()
export class TicketMessageRepositoryImpl extends BaseRepositoryImpl<TicketMessageDocument> {
  constructor(
    @InjectModel(TicketMessage.name)
    protected ticketMessageModel: Model<TicketMessageDocument>,
  ) {
    super(ticketMessageModel);
  }
}
