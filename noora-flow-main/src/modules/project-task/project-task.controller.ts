import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  forwardRef,
  ForbiddenException,
  HttpStatus,
  UseInterceptors,
  Req,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ProjectTaskService } from './project-task.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ProjectService } from '../project/project.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ProjectType } from 'src/common/const/enums';
import CustomError from 'src/common/providers/custom-error';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueueService } from '../queue/queue.service';
import { UsersService } from '../users/services/users.service';
import { BuyerService } from '../users/services/buyer.service';
import { CustomMessages } from 'src/common/const/custom-messages';
import { IndicatorService } from '../indicator/indicator.service';
import { ProjectTaskFileInterceptor } from './interceptors/project-task-file.interceptor';
import * as fs from 'fs';
import { Response } from 'express';

@ApiTags('project-task')
@ApiBearerAuth('token')
@Controller('project-task')
export class ProjectTaskController {
  constructor(
    private readonly projectTaskService: ProjectTaskService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    private readonly queueService: QueueService,
    private readonly usersService: UsersService,
    private readonly buyerService: BuyerService,
    private readonly indicatorService: IndicatorService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROJECT_TASK,
  })
  @Post()
  async create(
    @Body() createProjectTaskDto: CreateProjectTaskDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (
      createProjectTaskDto.reminder &&
      (new Date(createProjectTaskDto.reminder) < new Date() ||
        new Date(createProjectTaskDto.reminder) >
          new Date(createProjectTaskDto.deadline))
    ) {
      throw new CustomError(HttpStatus.BAD_REQUEST, 'reminder is not valid');
    }
    const taskNo = await this.indicatorService.findByKeyAndIncrement('tasks');
    const order = await this.projectTaskService.count({
      project: createProjectTaskDto.project,
      status: createProjectTaskDto.status,
    });
    const task = await this.projectTaskService.create({
      ...createProjectTaskDto,
      taskNo,
      createdBy: activeUser.id,
      order: order + 1,
    });

    if (!task || !task._id) {
      throw new CustomError(500, 'Failed to create task');
    }
    if (createProjectTaskDto.reminderMethod) {
      const { phoneNo } = await this.usersService.findOne({
        _id: createProjectTaskDto.assignee,
      });

      await this.queueService.addReminder({
        ...createProjectTaskDto,
        phoneNo,
        activityId: task._id,
      });
    }
    return task;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROJECT_TASK,
  })
  @Get()
  async findAll(
    @Query() getQueryDto: GetQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    let filters = JSON.parse(getQueryDto?.filters || '{}');
    getQueryDto.populate = [
      { path: 'assignee', populate: { path: 'userFiles' } },
      'project',
      'status',
      'labels',
      ...(getQueryDto.populate ? getQueryDto.populate.split(' ') : []),
    ];

    const projects = await this.projectService.findWithOutPagination({
      members: { $elemMatch: { $eq: activeUser.id } },
    });
    const projectIds = projects.map((project) => project._id);
    if (
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('admins')
    ) {
      filters = {
        ...filters,
        $or: [
          { assignee: activeUser.id },
          { createdBy: activeUser.id },
          { project: { $in: projectIds } },
        ],
      };
      getQueryDto.filters = JSON.stringify(filters);
    }
    // return await this.projectTaskService.findAll(getQueryDto);
    const projectTasks = await this.projectTaskService.findAll(getQueryDto);
    for (let i = projectTasks.data.length - 1; i >= 0; i--) {
      const p: any = projectTasks.data[i];
      const createdById =
        typeof p.createdBy === 'string'
          ? p.createdBy
          : p.createdBy?.id?.toString();

      if (
        p.isConfidential &&
        p.assignee.id.toString() !== activeUser.id &&
        createdById !== activeUser.id &&
        !activeUser.groups.includes('system-admin')
      ) {
        projectTasks.data.splice(i, 1);
      }
    }
    projectTasks.count = projectTasks.data.length;

    return projectTasks;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROJECT_TASK,
  })
  @Delete(':id')
  async delete(
    @Param('id') projectTaskId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const task = await this.projectTaskService.findById(projectTaskId);

    if (task.createdBy != activeUser.id) {
      throw new ForbiddenException('You are not able to delete this task');
    }
    return await this.projectTaskService.deleteById(projectTaskId);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROJECT_TASK,
  })
  @Patch(':id')
  async update(
    @Param('id') projectTaskId: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const task = await this.projectTaskService.findById(projectTaskId);

    if (!task) {
      throw new CustomError(HttpStatus.NOT_FOUND, 'Task does not exist');
    }
    if (task.createdBy != activeUser.id && task.assignee != activeUser.id) {
      throw new ForbiddenException('You are not able to modify this task');
    }

    const existingJob = await this.queueService.getJobByActivityId(
      projectTaskId,
    );

    if (
      updateProjectTaskDto.reminder &&
      new Date(task.reminder).getTime() !==
        new Date(updateProjectTaskDto.reminder).getTime()
    ) {
      if (
        updateProjectTaskDto.reminder &&
        (new Date(updateProjectTaskDto.reminder) < new Date() ||
          new Date(updateProjectTaskDto.reminder) >
            new Date(updateProjectTaskDto.deadline))
      ) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          CustomMessages.BAD_REQUEST,
        );
      }
    }

    if (existingJob) {
      await existingJob.remove();
    }

    if (
      updateProjectTaskDto.status &&
      updateProjectTaskDto.status !== task.status
    ) {
      const order = await this.projectTaskService.count({
        project: task.project,
        status: updateProjectTaskDto.status,
      });
      updateProjectTaskDto.order = order + 1;

      await this.projectTaskService.updateMany(
        {
          project: task.project,
          status: task.status,
          order: { $gt: task.order },
        },
        { $inc: { order: -1 } },
      );
    }

    if (
      updateProjectTaskDto.status &&
      updateProjectTaskDto.status === task.status &&
      updateProjectTaskDto.order !== task.order
    ) {
      if (updateProjectTaskDto.order < task.order) {
        await this.projectTaskService.updateMany(
          {
            project: task.project,
            status: task.status,
            order: { $gte: updateProjectTaskDto.order, $lt: task.order },
          },
          { $inc: { order: 1 } },
        );
      } else {
        await this.projectTaskService.updateMany(
          {
            project: task.project,
            status: task.status,
            order: { $lte: updateProjectTaskDto.order, $gt: task.order },
          },
          { $inc: { order: -1 } },
        );
      }
    }
    //TODO check status for reminder

    const updatedTask = await this.projectTaskService.findByIdAndUpdate(
      projectTaskId,
      updateProjectTaskDto,
    );

    if (
      new Date(task.reminder).getTime() ===
        new Date(updateProjectTaskDto.reminder).getTime() &&
      new Date(task.reminder) < new Date()
    ) {
      return updatedTask;
    }

    if (task.reminder || updateProjectTaskDto.reminder) {
      const user =
        (await this.usersService.findOne({
          _id: updateProjectTaskDto.assignee,
        })) ||
        (await this.usersService.findOne({
          _id: task.assignee,
        }));

      await this.queueService.addReminder({
        ...updateProjectTaskDto,
        phoneNo: user.phoneNo,
        activityId: projectTaskId,
      });
    }
    return updatedTask;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROJECT_TASK,
  })
  @Patch(':taskId/:status')
  async updateStatus(
    @Param('taskId') taskId: string,
    @Param('status') status: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const task = await this.projectTaskService.findById(taskId);
    const order = await this.projectTaskService.count({
      project: task.project,
      status,
    });
    if (task.createdBy != activeUser.id && task.assignee != activeUser.id) {
      throw new ForbiddenException('You are not able to modify this task');
    }
    const existingJob = await this.queueService.getJobByActivityId(taskId);

    if (task.type && existingJob) {
      await existingJob.remove();
    }

    if (status === task.status) {
      return;
    } else {
      await this.projectTaskService.updateMany(
        {
          project: task.project,
          status: task.status,
          order: { $gt: task.order },
        },
        { $inc: { order: -1 } },
      );

      return await this.projectTaskService.updateById(taskId, {
        status,
        order: order + 1,
      });
    }
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROJECT_TASK,
  })
  @Post('activity')
  async createActivity(
    @Body() createActivityDto: CreateActivityDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const project = await this.projectService.findOne({
      type: ProjectType.ACTIVITY,
    });

    if (
      createActivityDto.reminder &&
      new Date(createActivityDto.reminder) < new Date()
    ) {
      throw new CustomError(HttpStatus.BAD_REQUEST, 'reminder is not valid');
    }

    const assignee = createActivityDto.assignee ?? activeUser.id;
    if (project?.members) {
      const isAssigneeMember = project.members.includes(assignee);

      if (!isAssigneeMember) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          'Assignee is not a member of the project',
        );
      }
    }
    const taskNo = await this.indicatorService.findByKeyAndIncrement('tasks');

    const activityData = {
      ...createActivityDto,
      assignee,
      taskNo,
      project: project?._id,
      createdBy: activeUser.id,
    };
    if (
      createActivityDto.status === project?.statuses[1]?.id ||
      createActivityDto.status === project?.statuses[2]?.id
    ) {
      delete activityData.reminder;
      delete activityData.reminderMethod;
    }

    const activity = await this.projectTaskService.create(activityData);

    if (!activity || !activity._id) {
      throw new CustomError(500, 'Failed to create the activity.');
    }
    if (
      createActivityDto.reminderMethod &&
      createActivityDto.status === project?.statuses[0]?.id
    ) {
      const { phoneNo } = await this.usersService.findOne({ _id: assignee });
      const findBuyer = createActivityDto.buyerId
        ? await this.buyerService.findOne({
            _id: createActivityDto.buyerId,
          })
        : null;
      await this.queueService.addReminder({
        ...createActivityDto,
        phoneNo,
        assignee,
        activityId: activity._id,
        buyer: findBuyer?.name,
      });
    }
    return activity;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROJECT_TASK,
  })
  @Patch(':id/update/activity')
  async updateActivity(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const activity = await this.projectTaskService.findById({ _id: id });
    if (!activity) {
      throw new CustomError(HttpStatus.NOT_FOUND, 'Activity does not exist');
    }

    const project = await this.projectService.findOne({
      type: ProjectType.ACTIVITY,
    });
    const existingJob = await this.queueService.getJobByActivityId(id);

    //Permission check
    if (
      activity.createdBy != activeUser.id &&
      activity.assignee != activeUser.id
    ) {
      throw new ForbiddenException('You are not able to modify this task');
    }

    if (existingJob) {
      await existingJob.remove();
    }

    if (
      updateActivityDto.status === project?.statuses[1]?.id ||
      updateActivityDto.status === project?.statuses[2]?.id
    ) {
      delete updateActivityDto.reminder;
      delete updateActivityDto.reminderMethod;
      return await this.projectTaskService.updateById(
        { _id: id },
        { ...updateActivityDto },
      );
    }

    if (
      updateActivityDto.reminder &&
      new Date(updateActivityDto.reminder) < new Date()
    ) {
      throw new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST);
    }
    const updatedActivity = await this.projectTaskService.updateById(
      { _id: id },
      { ...updateActivityDto },
    );

    if (activity.reminder || updateActivityDto.reminder) {
      const assignee = updateActivityDto.assignee;
      const user = await this.usersService.findOne({ _id: assignee });
      const buyer = activity.buyerId
        ? await this.buyerService.findOne({
            _id: activity.buyerId,
          })
        : null;

      await this.queueService.addReminder({
        ...updateActivityDto,
        assignee,
        phoneNo: user.phoneNo,
        activityId: id,
        buyer: buyer?.name,
      });
    }
    return updatedActivity;
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FILE,
  })
  @ApiBearerAuth('token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post('upload/:taskId')
  @UseInterceptors(ProjectTaskFileInterceptor)
  async uploadFile(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.projectTaskService.findOne({ _id: taskId });
    const filePaths = files.map(
      (file) => `${file.destination}/${file.filename}`,
    );
    if (!task) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new CustomError(HttpStatus.NOT_FOUND, 'Task does not exist');
    }
    if (
      task.createdBy != activeUser.id &&
      task.assignee.toString() != activeUser.id
    ) {
      const unlinkPromises = filePaths.map((filePath) =>
        fs.promises.unlink(filePath),
      );
      await Promise.all(unlinkPromises);
      throw new ForbiddenException('You are not able to modify this task');
    }
    return await this.projectTaskService.findOneAndUpdate(
      { _id: taskId },
      { $set: { files: filePaths } },
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FILE,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
        },
      },
      required: ['filePath'],
    },
  })
  @ApiBearerAuth('token')
  @Post('get-file')
  async getFile(
    @ActiveUser() user: ActiveUserData,
    @Body() body: { filePath: string },
    @Res() res: Response,
  ) {
    return res.download(body.filePath);
  }
}
