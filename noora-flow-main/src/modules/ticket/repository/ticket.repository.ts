import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketRepositoryImpl extends BaseRepositoryImpl<TicketDocument> {
  constructor(
    @InjectModel(Ticket.name)
    protected ticketModel: Model<TicketDocument>,
  ) {
    super(ticketModel);
  }
}
