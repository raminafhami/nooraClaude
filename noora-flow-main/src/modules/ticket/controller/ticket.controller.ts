import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import {
  UpdateTicketDto,
  UpdateTicketStatusDto,
} from '../dto/update-ticket.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TicketMessageService } from '../services/ticket-message.service';
import { ActiveUser } from 'src/modules/iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';
import { IndicatorService } from 'src/modules/indicator/indicator.service';
import {
  PermissionAction,
  Subjects,
} from 'src/modules/iam/authentication/enums';
import { CheckPermissions } from 'src/modules/iam/authentication/decorators/permissions.decorator';

@ApiTags('ticket')
@ApiBearerAuth('token')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly ticketMessageService: TicketMessageService,
    private readonly indicatorService: IndicatorService,
  ) { }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.TICKET,
  })
  @Post()
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const ticketNo = await this.indicatorService.findByKeyAndIncrement(
      createTicketDto.indicatorKey,
    );

    delete createTicketDto.indicatorKey;
    const ticket = await this.ticketService.create({
      ...createTicketDto,
      createdBy: user.id,
      ticketNo,
    });
    await this.ticketMessageService.create({
      content: createTicketDto.content,
      ticketId: ticket.id,
      type: 'TEXT',
      createdBy: user.id,
    });
    return ticket;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TICKET,
  })
  @Get()
  async findAll(
    @Query() queryDto: GetQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    // const filter = JSON.parse(queryDto.filters || '{}');
    // filter.$or = [
    //   { createdBy: user.id },
    //   { assignee: user.id },
    //   { group: { $in: user.groups } },
    // ];
    // queryDto.filters = JSON.stringify(filter);

    queryDto.populate = [
      'lastMessage',
      { path: 'createdBy', select: '_id name lastname' },
      { path: 'assignee', select: '_id name lastname' },
    ] as any;
    // queryDto.sort = JSON.stringify({ priority: -1, createdAt: -1 });
    const data = await this.ticketService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TICKET,
  })
  @ApiQuery({ name: 'isPublic', type: 'string', required: false })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
    @Query('isPublic') isPublic: string,
  ) {
    let filter = null;
    if (isPublic == '0') {
      await this.ticketMessageService.readMessages(user.id, id);
      filter = {
        $or: [{ createdBy: user.id }, { assignee: user.id }],
      };
    }
    const ticket = await this.ticketService.findOne(
      {
        _id: id,
        ...filter,
      },
      null,
      [
        'messages',
        { path: 'createdBy', select: '_id name lastname' },
        { path: 'assignee', select: '_id name lastname' },
      ],
    );
    if (!ticket) {
      throw new NotFoundException('ticket not exist or not assigned to you.');
    }
    return ticket;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TICKET,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newTicket = await this.ticketService.findOneAndUpdate(
      { _id: id, createdBy: user.id },
      { ...updateTicketDto, modifiedBy: user.id },
    );
    if (!newTicket) {
      throw new NotFoundException(
        'ticket not exist or cant update this ticket',
      );
    }
    return newTicket;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TICKET,
  })
  @Put(':id/claim')
  async claimTicket(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newTicket = await this.ticketService.findOneAndUpdate(
      { _id: id, group: { $in: user.groups }, assignee: { $eq: null } },
      { assignee: user.id, modifiedBy: user.id },
    );
    if (!newTicket) {
      throw new NotFoundException('ticket not exist or cant claim this ticket');
    }
    return newTicket;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TICKET,
  })
  @Put(':id/status')
  async changeTicketStatus(
    @Param('id') id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    //todo add update condition
    const newTicket = await this.ticketService.findOneAndUpdate(
      { _id: id, assignee: user.id },
      { ...updateTicketStatusDto, modifiedBy: user.id },
    );
    if (!newTicket) {
      throw new NotFoundException('ticket not exist or cant change status');
    }
    return newTicket;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.TICKET,
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    //todo add delete condition
    const checkDeleted = await this.ticketService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('ticket not exist');
    }
    await this.ticketMessageService.deleteAllMessage(id);
  }
}
