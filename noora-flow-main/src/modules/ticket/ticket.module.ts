import { Module } from '@nestjs/common';
import { TicketService } from './services/ticket.service';
import { TicketController } from './controller/ticket.controller';
import { TicketMessageService } from './services/ticket-message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import {
  TicketMessage,
  TicketMessageSchema,
} from './schemas/ticket-message.schema';
import {
  TicketMessageFile,
  TicketMessageFileSchema,
} from './schemas/ticket-message-file.schema';
import { TicketRepositoryImpl } from './repository/ticket.repository';
import { TicketMessageRepositoryImpl } from './repository/ticket-message.repository';
import { TicketMessageFileRepositoryImpl } from './repository/ticket-message-file.repository';
import { TicketMessageController } from './controller/ticket-message.controller';
import { IndicatorModule } from '../indicator/indicator.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: TicketMessage.name, schema: TicketMessageSchema },
      { name: TicketMessageFile.name, schema: TicketMessageFileSchema },
    ]),
    IndicatorModule,
  ],
  controllers: [TicketController, TicketMessageController],
  providers: [
    TicketService,
    TicketMessageService,
    TicketRepositoryImpl,
    TicketMessageRepositoryImpl,
    TicketMessageFileRepositoryImpl,
  ],
})
export class TicketModule {}
