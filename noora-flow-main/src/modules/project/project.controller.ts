import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ProjectTaskService } from '../project-task/project-task.service';
import { ProjectDocument } from './schemas/project.schema';
import { ProjectType } from 'src/common/const/enums';

@ApiTags('project')
@ApiBearerAuth('token')
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => ProjectTaskService))
    private readonly projectTaskService: ProjectTaskService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROJECT,
  })
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.projectService.create({
      ...createProjectDto,
      createdBy: activeUser.id,
    });
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROJECT,
  })
  @Get()
  async findAll(
    @Query() getQueryDto: GetQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    let filters = JSON.parse(getQueryDto?.filters || '{}');
    const typeFilter = { type: { $ne: ProjectType.ACTIVITY } };

    if (!filters.$and) {
      filters = { ...filters, $and: [typeFilter] };
    } else {
      filters.$and.push(typeFilter);
    }

    if (
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins') &&
      !activeUser.groups.includes('ceo')
    ) {
      filters = {
        ...filters,
        $or: [{ members: activeUser.id }, { createdBy: activeUser.id }],
      };
      // getQueryDto.filters = JSON.stringify(filters);
    }
    getQueryDto.filters = JSON.stringify(filters);
    const projects = await this.projectService.findAll(getQueryDto);
    let result: { data: any[]; count: number } = { data: [], count: 0 };
    result.count = projects.count;
    for (let project of projects.data) {
      let projectTasks = await this.projectTaskService.findWithOutPagination({
        project: project._id,
      });
      let sumProgress: number = 0;

      for (let projectTask of projectTasks) {
        sumProgress += projectTask.progress;
      }
      (Math.round((sumProgress / projectTasks.length) * 100) / 100).toFixed(2);
      result.data.push({
        ...JSON.parse(JSON.stringify(project)),
        totalProgress:
          parseFloat(
            (
              Math.round((sumProgress / projectTasks.length) * 100) / 100
            ).toFixed(2),
          ) || 0,
      });
    }

    return result;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROJECT,
  })
  @Get(':id')
  async findOneById(
    @Param('id') projectId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const project = await this.projectService.findById(projectId, 'members');
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    let members: any[] = project.members;
    if (
      !members.some((member) => member.id == activeUser.id) &&
      project.createdBy != activeUser.id &&
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins') &&
      !activeUser.groups.includes('ceo')
    ) {
      throw new ForbiddenException('You are not a member of this project');
    }
    let projectTasks = await this.projectTaskService.findWithOutPagination({
      projectId: project.id,
    });
    let sumProgress = 0;
    for (let projectTask of projectTasks) {
      sumProgress += projectTask.progress;
    }
    return {
      ...JSON.parse(JSON.stringify(project)),
      totalProgress: sumProgress / projectTasks.length || 0,
    };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROJECT,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins') &&
      !activeUser.groups.includes('ceo')
    ) {
      throw new ForbiddenException('You are not able to update this project');
    }
    return this.projectService.updateById(id, updateProjectDto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROJECT,
  })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins') &&
      !activeUser.groups.includes('ceo')
    ) {
      throw new ForbiddenException('You are not able to update this project');
    }
    return this.projectService.deleteById(id);
  }

  @Patch('statuses/:projectId')
  async updateStatus(@Param('projectId') projectId: string, @Body() body: any) {
    // todo need to use promise all
    const result = [];
    let project: any;

    const projectStatuses = body.statuses;
    project = await this.projectService.findById(projectId);

    let existProjectStatusIds = project.statuses.map((status) =>
      status._id.toString(),
    );
    let statusesToDelete = existProjectStatusIds.filter(
      (id) => !projectStatuses.some((status) => status.id === id),
    );
    for (let i = 0; i < project.statuses.length; i++) {
      let founded = false;
      for (let j = 0; j < statusesToDelete.length; j++) {
        if (project.statuses[i]._id.toString() === statusesToDelete[j]) {
          founded = true;
        }
      }
      if (founded) {
        project.statuses.splice(i, 1);
        i -= i;
      }
    }
    await project.save();

    for (let i = 0; i < projectStatuses.length; i++) {
      if (projectStatuses[i].id) {
        project = await this.projectService.findOneAndUpdate(
          {
            _id: projectId,
            'statuses._id': projectStatuses[i].id,
          },
          {
            'statuses.$._id': projectStatuses[i].id,
            'statuses.$.name': projectStatuses[i].name,
            'statuses.$.order': projectStatuses[i].order,
          },
        );
      } else {
        project = await this.projectService.updateById(projectId, {
          $push: {
            statuses: {
              name: projectStatuses[i].name,
              order: projectStatuses[i].order,
            },
          },
        });
      }
      result.push(project);
    }
    return result;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROJECT,
  })
  @Get('type/activity')
  async getActivityProject(@ActiveUser() activeUser: ActiveUserData) {
    let getQueryDto: GetQueryDto = new GetQueryDto();
    let filters: any;

    if (
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins') &&
      !activeUser.groups.includes('ceo')
    ) {
      filters = {
        $or: [{ members: activeUser.id }, { createdBy: activeUser.id }],
      };
    }

    filters = { ...filters, $and: [{ type: ProjectType.ACTIVITY }] };
    getQueryDto.populate = 'members';

    getQueryDto.filters = JSON.stringify(filters);

    const project = await this.projectService.findAll(getQueryDto);

    return project.data[0];
  }
}
