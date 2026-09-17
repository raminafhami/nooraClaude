import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { Ticket } from '../schemas/ticket.schema';
import { TicketRepositoryImpl } from '../repository/ticket.repository';

@Injectable()
export class TicketService extends CrudService<Ticket> {
  constructor(private readonly ticketRepositoryImpl: TicketRepositoryImpl) {
    super(ticketRepositoryImpl);
  }
}
