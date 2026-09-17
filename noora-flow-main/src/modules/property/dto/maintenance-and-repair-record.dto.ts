import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class RepairRecordDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsString()
  @IsNotEmpty()
  type: 'REPAIR' | 'UPGRADE';
}

export class MaintenanceRecordDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsString()
  @IsNotEmpty()
  technician: string;
}

export class DecommissionPropertyDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @IsNotEmpty()
  scrapValue: number;
}
