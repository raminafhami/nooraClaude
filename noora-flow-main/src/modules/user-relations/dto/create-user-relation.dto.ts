import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserRelationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  coordinatorId: string;

  @IsOptional()
  marketerId: string;
}
