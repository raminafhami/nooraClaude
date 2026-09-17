import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { TicketMessage } from '../schemas/ticket-message.schema';
import { TicketMessageRepositoryImpl } from '../repository/ticket-message.repository';
import { TicketMessageFileRepositoryImpl } from '../repository/ticket-message-file.repository';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TicketMessageService extends CrudService<TicketMessage> {
  constructor(
    private readonly ticketMessageRepositoryImpl: TicketMessageRepositoryImpl,
    private readonly ticketMessageFileRepositoryImpl: TicketMessageFileRepositoryImpl,
  ) {
    super(ticketMessageRepositoryImpl);
  }
  async saveFile(
    ticketId: string,
    fileInfo: {
      filename: string;
      directory: string;
      path: string;
      mimetype: string;
    },
  ) {
    return this.ticketMessageFileRepositoryImpl.create({
      ticketId,
      ...fileInfo,
    });
  }
  async getFile(fileId: string, ticketId: string) {
    return this.ticketMessageFileRepositoryImpl.findOne({
      _id: fileId,
      ticketId,
    });
  }

  async deleteAllMessage(ticketId: string) {
    await this.ticketMessageRepositoryImpl.model.deleteMany({
      ticketId,
    });
    await this.ticketMessageFileRepositoryImpl.model.deleteMany({ ticketId });
    fs.rmSync(path.resolve('tickets', ticketId), {
      recursive: true,
      force: true,
    });
  }
  async readMessages(userId: string, ticketId: string) {
    await this.ticketMessageRepositoryImpl.updateMany(
      { createdBy: { $ne: userId }, ticketId },
      {
        $set: {
          readedAt: Date.now(),
        },
      },
    );
  }
}
