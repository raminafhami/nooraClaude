import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteUnofficialCostDto {
  @IsNotEmpty()
  @IsArray()
  costIds: string[];
}
