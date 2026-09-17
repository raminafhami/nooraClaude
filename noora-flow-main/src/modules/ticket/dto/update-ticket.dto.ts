import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../schemas/ticket.schema';

export class UpdateTicketDto extends PartialType(
  OmitType(CreateTicketDto, ['content', 'assignee', 'indicatorKey'] as const),
) {}

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: string;
}
