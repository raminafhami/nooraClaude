import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import {
  PermissionAction,
  Subjects,
} from 'src/modules/iam/authentication/enums';

export class CreatePermissionDto {
  @IsNotEmpty({
    message: 'actions is not given.',
  })
  @IsEnum(PermissionAction, {
    message: 'The given actions is not valid.',
    each: true,
  })
  actions: PermissionAction[] = [PermissionAction.READ];

  @IsNotEmpty({
    message: 'description is not given.',
  })
  description: string;

  @IsNotEmpty({
    message: 'subject is not given.',
  })
  @IsEnum(Subjects, {
    message: 'The given subject is not valid.',
  })
  subject: Subjects;

  @IsOptional()
  conditions?: string = '{}';
}
