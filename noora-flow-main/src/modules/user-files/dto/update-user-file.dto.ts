import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserFileDto } from './create-user-file.dto';

export class UpdateUserFileTitleDto extends PartialType(
  PickType(CreateUserFileDto, ['title'] as const),
) {}

export class UpdateUserFileStatusDto extends PartialType(
  PickType(CreateUserFileDto, ['status'] as const),
) {}
