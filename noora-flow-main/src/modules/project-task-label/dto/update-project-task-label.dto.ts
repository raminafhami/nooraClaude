import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectTaskLabelDto } from './create-project-task-label.dto';

export class UpdateProjectTaskLabelDto extends PartialType(CreateProjectTaskLabelDto) {}
