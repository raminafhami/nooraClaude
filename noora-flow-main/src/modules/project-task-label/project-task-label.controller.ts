import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectTaskLabelService } from './project-task-label.service';
import { CreateProjectTaskLabelDto } from './dto/create-project-task-label.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('project-task-label')
@ApiBearerAuth('token')
@Controller('project-task-label')
export class ProjectTaskLabelController {
  constructor(
    private readonly projectTaskLabelService: ProjectTaskLabelService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROJECT_TASK_LABEL,
  })
  @Post()
  async create(@Body() createProjectTaskLabelDto: CreateProjectTaskLabelDto) {
    return await this.projectTaskLabelService.create(createProjectTaskLabelDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROJECT_TASK_LABEL,
  })
  @Get()
  async get(@Query() getQueryDto: GetQueryDto) {
    return await this.projectTaskLabelService.findAll(getQueryDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROJECT_TASK_LABEL,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createProjectTaskLabelDto: CreateProjectTaskLabelDto,
  ) {
    return await this.projectTaskLabelService.updateById(
      id,
      createProjectTaskLabelDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROJECT_TASK_LABEL,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.projectTaskLabelService.deleteById(id);
  }
}
