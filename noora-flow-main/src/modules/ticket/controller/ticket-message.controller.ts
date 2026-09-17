import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { TicketMessageService } from '../services/ticket-message.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateTicketMessageDto } from '../dto/create-ticket-message.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/modules/iam/authentication/decorators/active-user.decorator';
import { TicketService } from '../services/ticket.service';
import { TicketStatus } from '../schemas/ticket.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerMemoryOptions, saveBufferToFile } from '../util/multer-util';
import { Response } from 'express';
import { CheckPermissions } from 'src/modules/iam/authentication/decorators/permissions.decorator';
import {
  PermissionAction,
  Subjects,
} from 'src/modules/iam/authentication/enums';

@ApiTags('ticket message')
@ApiBearerAuth('token')
@Controller('tickets/:ticketId/messages')
export class TicketMessageController {
  constructor(
    private readonly ticketMessageService: TicketMessageService,
    private readonly ticketService: TicketService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.TICKET_MESSAGE,
  })
  @UseInterceptors(FileInterceptor('file', multerMemoryOptions))
  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    @Param('ticketId') ticketId: string,
    @Body() message: CreateTicketMessageDto,
    @ActiveUser() user: ActiveUserData,
    @UploadedFile() file: any,
  ) {
    if (!file && !message.content) {
      throw new BadRequestException('content and file is empty');
    }
    const ticket = await this.ticketService.findOne({
      _id: ticketId,
      $or: [{ createdBy: user.id }, { assignee: user.id }],
      status: TicketStatus.OPEN,
    });
    if (!ticket) {
      throw new BadRequestException(
        'ticket not found or cant send message to this ticket.',
      );
    }
    let messageData = {
      content: message.content,
      ticketId,
      type: 'TEXT',
      createdBy: user.id,
    } as any;
    let fileResponse = null;
    if (file) {
      const fileData = await saveBufferToFile(
        file.buffer,
        ticketId,
        file.originalname,
      );
      const savedFile = await this.ticketMessageService.saveFile(ticket.id, {
        filename: fileData.filename,
        directory: fileData.directory,
        path: fileData.path,
        mimetype: file.mimetype,
      });
      messageData = {
        ...messageData,
        fileId: savedFile.id,
        content: !!messageData.content
          ? messageData.content
          : savedFile.filename,
        type: 'FILE',
      };
      fileResponse = {
        file: {
          id: savedFile.id,
          filename: savedFile.filename,
          mimetype: file.mimetype,
        },
      };
    }

    const ticketMessage = await this.ticketMessageService.create(messageData);
    return { ...ticketMessage.toJSON(), ...fileResponse };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TICKET_MESSAGE,
  })
  @Get()
  async findAll(
    @Param('ticketId') ticketId: string,
    @Query() queryDto: GetQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const ticket = await this.ticketService.findOne({
      _id: ticketId,
      $or: [{ createdBy: user.id }, { assignee: user.id }],
    });
    if (!ticket) {
      throw new BadRequestException('ticket not found.');
    }
    queryDto.populate = [
      { path: 'file' },
      { path: 'createdBy', select: '_id name lastname' },
    ] as any;
    const filter = JSON.parse(queryDto.filters || '{}');
    filter.ticketId = ticket.id;
    queryDto.filters = JSON.stringify(filter);
    queryDto.sort = JSON.stringify({ createdAt: -1 });
    const data = await this.ticketMessageService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TICKET_MESSAGE,
  })
  @Get('file/:fileId')
  async getFile(
    @Param('ticketId') ticketId: string,
    @Param('fileId') fileId: string,
    @ActiveUser() user: ActiveUserData,
    @Res() res: Response,
  ) {
    const ticket = await this.ticketService.findOne({
      _id: ticketId,
      $or: [{ createdBy: user.id }, { assignee: user.id }],
    });
    if (!ticket) {
      throw new BadRequestException('ticket not found.');
    }
    const file = await this.ticketMessageService.getFile(fileId, ticketId);
    if (!file) throw new NotFoundException('file not found');
    return res.download(file.path);
  }
}
