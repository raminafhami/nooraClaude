import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
  Req,
} from '@nestjs/common';
import { PersonnelAttendanceService } from './personnel-attendance.service';
import { CreatePersonnelAttendanceDto } from './dto/create-personnel-attendance.dto';
import { UpdatePersonnelAttendanceDto } from './dto/update-personnel-attendance.dto';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { query, Request } from 'express';
import { PersonnelAttendanceReportDto } from './dto/personnel-attendance-report.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { CreatePersonnelScheduleDto } from './dto/create-personnel-schedule.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ManualTimeDto } from './dto/manual-time.dto';
import { UpdateWholeTimesDto } from './dto/update-whole-times.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiBearerAuth('token')
@Controller('personnel-attendance')
@ApiTags('personnel-Attendance')
export class PersonnelAttendanceController {
  constructor(
    private readonly personnelAttendanceService: PersonnelAttendanceService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Post()
  create(
    @ActiveUser() user: ActiveUserData,
    @Body() createPersonnelAttendanceDto: CreatePersonnelAttendanceDto,
    @Ip() realIp: string,
    @Req() request: Request,
  ) {
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Tehran',
      hourCycle: 'h24',
      minute: 'numeric',
      hour: 'numeric',
    });

    const timeArray = timeString.split(':');
    const hoursAndMinutes = `${timeArray[0]}:${timeArray[1]}:00`;

    // return this.personnelAttendanceService.recordEntryOrExit(
    //   createPersonnelAttendanceDto,
    //   { activeUser: user },
    // );

    return this.personnelAttendanceService.recordEntryOrExit(
      { time: hoursAndMinutes },
      { activeUser: user },
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Get()
  async findAll(@Query() getQueryDto: GetQueryDto) {
    const data = await this.personnelAttendanceService.findAll(getQueryDto);
    return data;
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userAttendanceService.findOne(+returnd);
  // }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Get('/create-daily-record')
  @ApiExcludeEndpoint()
  async createDailyRecord(@Query() query: GetQueryDto) {
    query.populate = 'workingTimeRegulation';
    const temp = await this.personnelAttendanceService.createDailyRecord(query);
    return temp;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Post('/get-report')
  async getReport(
    @ActiveUser() user: ActiveUserData,
    @Query() personnelAttendanceReportDto: PersonnelAttendanceReportDto,
  ) {
    return await this.personnelAttendanceService.getReport(
      personnelAttendanceReportDto,
      user,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Post('/personnel-general-report')
  async personnelGeneralReport(
    @Query() personnelAttendanceReportDto: PersonnelAttendanceReportDto,
  ) {
    return await this.personnelAttendanceService.personnelGeneralReport(
      personnelAttendanceReportDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Post('/create-personnel-schedule')
  async createPersonnelSchedule(
    @Body() createPersonnelScheduleDto: CreatePersonnelScheduleDto,
  ) {
    return await this.personnelAttendanceService.createPersonnelSchedule(
      createPersonnelScheduleDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Get('/get-by-date/:date')
  @ApiProperty({ name: 'date', type: String })
  async getPersonnelAttendanceByDate(
    @Param('date') date: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.personnelAttendanceService.getPersonnelAttendanceByDate(
      date,
      user,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Get('/closing-books')
  @ApiExcludeEndpoint()
  async closingBooks() {
    return await this.personnelAttendanceService.closingBooks();
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_ATTENDANCE,
  })
  @Post('/manual-time')
  async manualTime(
    @Body() manualTimeDto: ManualTimeDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const { userId } = manualTimeDto;
    if (userId) {
      user.id = userId;
    }
    if (manualTimeDto.singleTime) {
      return await this.personnelAttendanceService.singleTime(
        manualTimeDto,
        user,
      );
    }
    return await this.personnelAttendanceService.manualTime(
      manualTimeDto,
      user,
    );
  }

  @Post('/update-whole-times')
  async updateWholeTimes(
    @Body() updateWholeTimeDto: UpdateWholeTimesDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!updateWholeTimeDto.userId) {
      updateWholeTimeDto.userId = activeUser.id;
    }
    return await this.personnelAttendanceService.updateWholeTimes(
      updateWholeTimeDto,
    );
  }
}
