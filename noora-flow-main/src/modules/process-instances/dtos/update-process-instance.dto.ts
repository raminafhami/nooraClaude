import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class Params {
  [key: string]: any;
}

export class UpdateProcessInstanceDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;
}

export class UpdateProcessInstanceQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ default: false })
  readonly cascade: string;
}

export class UpdateProcessWatcher {
  @IsMongoId()
  processInstanceId: string;

  @IsMongoId()
  watcherId: string;
}

export class UpdateInstanceState {
  @IsMongoId()
  processInstanceId: string;

  @IsNotEmpty()
  stateName: string;
}

export class UpdateInstancesDebt {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  checkCredit?: boolean = false;
}

export class CancelProcessInstanceDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ValidateIf((o) => o.reason === 'سایر')
  @IsNotEmpty({ message: 'Description must not be empty when reason is other' })
  @IsString()
  description?: string;
}
