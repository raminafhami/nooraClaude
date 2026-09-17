import { IsString } from 'class-validator';

export class NotifySmsDto {
  @IsString()
  phoneNo: string;
}
