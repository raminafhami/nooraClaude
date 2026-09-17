import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationPriority } from '../enums';
import { Type } from 'class-transformer';

class Recipient {
  @IsArray()
  @IsString({ each: true })
  users: string[];

  @IsArray()
  @IsString({ each: true })
  groups: string[];
}
export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsOptional()
  @Type(() => Recipient)
  recipient: Recipient;

  @IsBoolean()
  sendNotification = false;
}
