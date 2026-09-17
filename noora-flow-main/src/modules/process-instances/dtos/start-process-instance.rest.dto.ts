import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class Params {
  [key: string]: any;
}

export class StartProcessInstanceBodyDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;
}
