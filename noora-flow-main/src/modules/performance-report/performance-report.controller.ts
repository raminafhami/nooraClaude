import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import {
  ActivityTypeDto,
  ChartQueryDto,
  CreateManualActivityDto,
  UpdateManualActivityDto,
} from './dto/manual-activity.dto';
import { PerformanceReportService } from './performance-report.service';

@ApiTags('performance-report')
@ApiBearerAuth('token')
@Controller('performance-report')
export class PerformanceReportController {
  constructor(private readonly performanceReportService: PerformanceReportService) {}

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('my-day')
  myDay(@ActiveUser() user: ActiveUserData, @Query('date') date?: string) {
    return this.performanceReportService.myDay(user, date);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Post('my-day/send')
  sendToday(@ActiveUser() user: ActiveUserData) {
    return this.performanceReportService.sendToday(user);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('my-units')
  myUnits(@ActiveUser() user: ActiveUserData) {
    return this.performanceReportService.myUnits(user);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('activity-types')
  myActivityTypes(@ActiveUser() user: ActiveUserData) {
    return this.performanceReportService.myActivityTypes(user);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Post('activities')
  createManual(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateManualActivityDto,
  ) {
    return this.performanceReportService.createManual(user, dto);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Put('activities/:id')
  updateManual(
    @ActiveUser() user: ActiveUserData,
    @Param('id') id: string,
    @Body() dto: UpdateManualActivityDto,
  ) {
    return this.performanceReportService.updateManual(user, id, dto);
  }

  @CheckPermissions({
    action: PermissionAction.READ_OWN,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Delete('activities/:id')
  deleteManual(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
    return this.performanceReportService.deleteManual(user, id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('access')
  access() {
    return this.performanceReportService.access();
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('personnel')
  personnel(@ActiveUser() user: ActiveUserData, @Query('date') date?: string) {
    return this.performanceReportService.personnelList(user, date);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('personnel/:userId/day')
  personnelDay(
    @ActiveUser() user: ActiveUserData,
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return this.performanceReportService.personnelDay(user, userId, date);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('filters')
  filters(@ActiveUser() user: ActiveUserData) {
    return this.performanceReportService.filters(user);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERFORMANCE_REPORT,
  })
  @Get('charts')
  charts(@ActiveUser() user: ActiveUserData, @Query() query: ChartQueryDto) {
    return this.performanceReportService.charts(user, query);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_GROUP,
  })
  @Get('admin/activity-types')
  listTypes() {
    return this.performanceReportService.listActivityTypes();
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER_GROUP,
  })
  @Post('admin/activity-types')
  createType(@Body() dto: ActivityTypeDto) {
    return this.performanceReportService.createActivityType(dto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_GROUP,
  })
  @Put('admin/activity-types/:id')
  updateType(@Param('id') id: string, @Body() dto: ActivityTypeDto) {
    return this.performanceReportService.updateActivityType(id, dto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER_GROUP,
  })
  @Delete('admin/activity-types/:id')
  deleteType(@Param('id') id: string) {
    return this.performanceReportService.deleteActivityType(id);
  }
}
