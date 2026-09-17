import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiHeader,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import {
  CompleteTaskBody,
  CompleteTaskParams,
  CompleteTasksHeadersDto,
  GetTasksQueryDto,
  GetTasksHeadersDto,
  GetTasksParamsDto,
  ReAssignTaskBody,
  ClaimTaskBody,
  PropDto,
  GetMyTasksQueryDto,
} from './dtos';
import { CommonHeadersDto } from 'src/shared/dtos';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { GetProcessInstanceStatsQueryDto } from '../process-instances/dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/providers/custom-error';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { CustomMessages } from 'src/common/const/custom-messages';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiBearerAuth('token')
@ApiTags('Tasks')
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks/candidate')
  async findAllUserCandidateTasks(
    @ActiveUser() user: ActiveUserData,
    @Query() getUserTaskDto: GetTasksQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.findAllUserCandidateTasks(user, getUserTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks/todo')
  async findAllUserAssignedTodoTasks(
    @ActiveUser() user: ActiveUserData,
    @Query() getUserTaskDto: GetTasksQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.findAllUserAssignedTodoTasks(user, getUserTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks/inbox')
  async findAllUserInboxTask(
    @ActiveUser() user: ActiveUserData,
    @Query() getUserTaskDto: GetMyTasksQueryDto,
  ) {
    return this.tasksService.findAllUserInboxTask(user, getUserTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks/done')
  async findAllUserAssignedDoneTasks(
    @ActiveUser() user: ActiveUserData,
    @Query() getUserTaskDto: GetTasksQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.findAllUserAssignedDoneTasks(user, getUserTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks-status/:status')
  async getAllUserAssignedTaskByStatus(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() getUserTaskDto: GetMyTasksQueryDto,
    @Param('status') status: string,
  ): Promise<CustomResponse | CustomError> {
    const filter = JSON.parse(getUserTaskDto.filters || '{}');
    filter.status = status;
    getUserTaskDto.filters = JSON.stringify(filter);
    return this.tasksService.findAllUserAssignedTasksByStatus(
      activeUser,
      getUserTaskDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('my-tasks/:taskId')
  async getTask(
    @ActiveUser() user: ActiveUserData,
    @Param('taskId') taskId: string,
    @Query() { props }: PropDto,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.tasksService.getTaskById(
      user,
      taskId,
      props?.split(','),
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, data);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('tasks')
  async findTasks(
    @ActiveUser() user: ActiveUserData,
    @Query() query: GetTasksQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.findTasks(user, query);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('tasks/:processInstanceId/todo')
  async findTodoTasks(@Param('processInstanceId') processInstanceId: string) {
    const tasks = await this.tasksService.findTodoTaskOfInstance(
      processInstanceId,
    );
    return tasks;
  }

  // @Put('tasks/:processInstanceId/:taskId')
  // async updateOne(@Param('id') id: string, @Body() updateUserTaskDto: UpdateUserTaskDto):
  //   Promise<CustomResponse | CustomError> {
  //   return this.tasksService.updateTask(id, updateUserTaskDto);
  // }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TASK,
  })
  @Post('tasks/:processInstanceId/complete')
  async completeTask(
    @ActiveUser() user: ActiveUserData,
    @Param() params: CompleteTaskParams,
    @Body() completeTaskDto: CompleteTaskBody,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.completeTask(user, params, completeTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TASK,
  })
  @Post('tasks/:processInstanceId/reassign')
  async reassignTask(
    @ActiveUser() user: ActiveUserData,
    @Param() params: CompleteTaskParams,
    @Body() completeTaskDto: ReAssignTaskBody,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.reassignTask(user, params, completeTaskDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.TASK,
  })
  @Post('tasks/:taskId/claim')
  async claimTask(
    @ActiveUser() user: ActiveUserData,
    @Param('taskId') taskId: string,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.claimTask(user, taskId);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('tasks/stats')
  async getStatsByDefinitionId(
    @ActiveUser() user: ActiveUserData,
    @Query() query: GetProcessInstanceStatsQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.getTasksStats(user, query, false);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.TASK,
  })
  @Get('tasks/my-stats')
  async getMyStatsByDefinitionId(
    @ActiveUser() user: ActiveUserData,
    @Query() query: GetProcessInstanceStatsQueryDto,
  ): Promise<CustomResponse | CustomError> {
    return this.tasksService.getTasksStats(user, query, true);
  }
}
