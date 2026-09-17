import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, isString, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectorTypes, InputStatuses } from 'src/common/const/enums';

class Params {
  [key: string]: any;
}

export class CompleteTaskBody {
  @ApiProperty()
  @IsOptional()
  taskId: string;

  @ApiProperty()
  @IsOptional()
  taskKey: string;

  @ApiProperty({ type: String, default: '' })
  @IsEnum(InputStatuses)
  @IsOptional()
  status?: InputStatuses;

  @ApiProperty()
  @ValidateIf((o) => o.status === InputStatuses.HOLD || o.status === InputStatuses.CANCEL)
  @IsNotEmpty({ message: 'Reason must not be empty when status is HOLD or CANCEL' })
  @IsString()
  reason?:string;

  @ApiProperty()
  @ValidateIf((o) => o.reason === 'سایر')
  @IsNotEmpty({ message: 'Description must not be empty when reason is other' })
  @IsString()
  description?:string

  @ApiProperty({ type: Params })
  @IsOptional()
  // @Type(() => Params)
  parameters: Params;
}

export class CompleteTaskParams {
  @ApiProperty()
  @IsString()
  processInstanceId: string;
}

export class CompleteTaskQuery {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;
}

export class CompleteTasksHeadersDto {
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly 'x-tenant-id': string;

  'user-id'?: string;
}
