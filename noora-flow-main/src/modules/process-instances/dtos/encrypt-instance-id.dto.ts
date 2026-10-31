import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class EncryptInstanceIdDto {
  @ApiProperty()
  @IsMongoId()
  instanceId: string;
}
