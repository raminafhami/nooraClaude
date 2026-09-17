import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTicketMessageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: any;

  @IsOptional()
  @IsString()
  content?: string;
}
