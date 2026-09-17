import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  TicketMessageFile,
  TicketMessageFileDocument,
} from '../schemas/ticket-message-file.schema';

@Injectable()
export class TicketMessageFileRepositoryImpl extends BaseRepositoryImpl<TicketMessageFileDocument> {
  constructor(
    @InjectModel(TicketMessageFile.name)
    protected ticketMessageFileModel: Model<TicketMessageFileDocument>,
  ) {
    super(ticketMessageFileModel);
  }
}
