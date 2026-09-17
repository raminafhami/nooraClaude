import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ChangeCourseParticipantDto } from './dto/change-course-participant.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('courses')
@ApiBearerAuth('token')
@Controller('education/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.COURSE,
  })
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    const participantNo = new Set(createCourseDto.users).size;
    const course = await this.courseService.create({
      ...createCourseDto,
      participantNo,
    });

    return course;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COURSE,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = '-users';
    const data = await this.courseService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COURSE,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findById(id, 'userList');
    if (!course) {
      throw new NotFoundException('course not exist');
    }
    return course;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.COURSE,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    let newCourse = await this.courseService.findByIdAndUpdate(
      id,
      updateCourseDto,
    );
    if (!newCourse) {
      throw new NotFoundException('course not exist');
    }
    newCourse = newCourse.toJSON();
    delete newCourse.users;
    return newCourse;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.COURSE,
  })
  @Put(':id/participants')
  async updateParticipants(
    @Param('id') id: string,
    @Body() changeCourseParticipantDto: ChangeCourseParticipantDto,
  ) {
    let newCourse = await this.courseService.findByIdAndUpdateParticipants(
      id,
      changeCourseParticipantDto,
    );
    if (!newCourse) {
      throw new NotFoundException('course not exist');
    }

    const participantNo = new Set(newCourse.users).size;
    newCourse = await this.courseService.findByIdAndUpdate(id, {
      participantNo,
    });
    newCourse = newCourse.toJSON();
    delete newCourse.users;
    return newCourse;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.COURSE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.courseService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('course not exist.');
    }
  }
}
