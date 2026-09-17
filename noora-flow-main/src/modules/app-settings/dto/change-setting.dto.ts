import { IsNotEmpty } from 'class-validator';

export class ChangeSettingDto {
  @IsNotEmpty()
  value: any;
}
