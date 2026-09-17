import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

class MessageParameters {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
export class SendMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  phoneNo: string;

  @ApiProperty()
  @IsNotEmpty()
  templateNo: number;

  @IsArray()
  @Type(() => MessageParameters)
  messageParameters: MessageParameters[];
}
